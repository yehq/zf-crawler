const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

// first login
// user:1140299340
// pass:134011
// inputCode:5bem
// url:http://jwxt.zf.edu.cn/xs_main.aspx?xh=1140299340

// second login
// TextBox1:1140299340
// TextBox2:331081199602134011
// TextBox3:uq0b
// RadioButtonList1:学生
// Button1:
// lbLanguage:
module.exports = app => {
    class ZfService extends app.Service {
        /**
         * 校外访问
         */
        async offCampusAuthentication() {
            const { off_campus_authentication_url } = app.config.zf;
            const { ctx } = this;
            const { username, password } = ctx.session;
            let ezproxy;
            const resp = await app.curl(off_campus_authentication_url, {
                method: 'POST',
                data: {
                    user: username,
                    pass: password,
                },
                rejectUnauthorized: false,
            });
            
            if (resp.status == 302) {
                const cookie = resp.headers['set-cookie'][0];
                ezproxy = cookie.split(';')[0].split('=')[1];
                ctx.session.ezproxy = ezproxy;
            } else {
                ctx.throw(415, '校外访问登录失败');
            }
        }

        //get ASP.NET_SessionId and __VIEWSTATE
        async getLoginParams() {
            const { root_url, action } = app.config.zf;
            const { ctx } = this;
            const { ezproxy } = ctx.session;
            let sessionId = '';
            const resp = await app.curl(`${root_url}/${action.login}`, {
                method: 'GET',
                headers: {
                    Cookie: `${ezproxy ? `ezproxy=${ezproxy};` : ''}`
                }
            });
            if (resp.status == 200) {
                const cookie = resp.headers['set-cookie'][0];
                sessionId = cookie.split(';')[0].split('=')[1];
            } else if (resp.status === 302 || resp.status === 403) {
                ctx.throw(403, '请先进行校外访问登录！');
            } else {
                ctx.throw(resp.status, '教务系统登录失败');
            }

            const $ = cheerio.load(resp.data.toString());
            const __VIEWSTATE = $("input[name='__VIEWSTATE']").val();
            ctx.session.sessionId = sessionId;
            ctx.session.viewstate = __VIEWSTATE;

            if (!sessionId) ctx.throw(404, '获取sessionId失败')
        }

        /**
         * 下载教务系统登录验证码返回
         * ASP.NET_SessionId
         */
        async fetchCheckCodeImg() {
            const { root_url, action, check_code_clear_interval, check_code_save_dir } = app.config.zf;
            const { ctx } = this;
            const { sessionId, ezproxy, username } = ctx.session;
            const checkCodeImgName = `${sessionId}-${Date.now() + check_code_clear_interval}.jpg`;
            const checkCodePath = `${check_code_save_dir}\\${checkCodeImgName}`.replace(/\\/g, '/');
            const resp = await app.curl(`${root_url}/${action.check_code}`, {
                method: 'GET',
                headers: {
                    Cookie: `ASP.NET_SessionId=${sessionId}; ezproxy=${ezproxy}`
                }
            });
            fs.writeFileSync(checkCodePath, resp.data);
            return checkCodePath.substring(checkCodePath.indexOf('/public'));
        }

        /**
         * 教务系统登录
         * @param {String} checkCode 
         */
        async login(checkCode, username, password) {
            const { ctx } = this;
            const { ezproxy, sessionId, viewstate } = ctx.session;
            if (!username) {
                username = ctx.session.username;
            } else {
                ctx.session.username = username;
            }
            if (!password) password = ctx.session.password;
            const { root_url, action, login_params } = app.config.zf;
            let resp;
            try {
                resp = await app.curl(`${root_url}/${action.login}`, {
                    method: 'POST',
                    headers: {
                        Cookie: `ASP.NET_SessionId=${sessionId}; ezproxy=${ezproxy}`
                    },
                    data: {
                        [login_params.viewstate]: viewstate,
                        [login_params.username]: username,
                        [login_params.password]: password,
                        [login_params.check_code]: checkCode,
                        [login_params.login_type]: '学生',
                        Button1: '',
                        lbLanguage: '',
                    }
                });
            } catch (e) {
                ctx.throw(resp.status, '教务系统登录失败，可能是请求超时，请重新登录！');
            }
            if (resp.status !== 302) {
                ctx.throw(resp.status, '教务系统登录失败！');
            }
        }

        /**
         * 获得主页信息
         * 解析主页的url存到session
         */
        async getMain() {
            const { ctx } = this;
            const { root_url, action } = app.config.zf;
            const { username } = ctx.session;
            const html = await this._get(`${root_url}/${action.main}?xh=${username}`);
            const $ = cheerio.load(html);
            const $aTags = $('ul.sub a');
            const actions = {};
            $aTags.each((index, item) => {
                const $this = $(item);
                actions[$this.text()] = $this.attr('href');
            })
            ctx.session.actions = actions;
            return html;
        }

        async getPersonal() {
            const { root_url } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const html = await this._get(`${root_url}/${actions['个人信息']}`);
            const personal = this.handlePersonal(html);
            return personal;
        }

        /**
         * 获得课表
         */
        async getTimetable() {
            const { root_url } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const html = await this._get(`${root_url}/${actions['学生个人课表']}`);
            const timetable = this.handleTimetable(html);
            return timetable;
        }

        /**
         * 获得考试安排
         */
        async getExam() {
            const { root_url, exam_column_map } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const html = await this._get(`${root_url}/${actions['学生考试查询']}`);
            const exams = this.handleCommonTable(html, exam_column_map, '#Datagrid1,#DataGrid1');
            return exams;
        }

    
        /**
         * 获得在校成绩
         * Button1: '按学期查询'  Button5: '按学年查询'
         * ddlXN:2016-2017  (学年) ddlXQ:2  (学期)
         * gnmkdm: 'N121616',
         */
        async getGrade() {
            const { root_url, grade_column_map } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const grade_url = `${root_url}/${actions['成绩查询']}`;
            const main = await this._get(grade_url);

            const $ = cheerio.load(main);
            const __VIEWSTATEGENERATOR = $("input[name='__VIEWSTATEGENERATOR']").val();
            const __VIEWSTATE = $("input[name='__VIEWSTATE']").val();
            const html = await this._post(grade_url, {
                Button1: '按学期查询',
                __VIEWSTATE,
                __VIEWSTATEGENERATOR,
            });
            const grades = this.handleCommonTable(html, grade_column_map, '#Datagrid1,#DataGrid1');
            return grades;
        }

        /**
         * 获得课程选择情况
         */
        async getCourseSelection() {
            const { root_url, course_selection_column_map } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const course_selection_url = `${root_url}/${actions['学生选课情况查询']}`;
            const html = await this._get(course_selection_url);
            const courseSelections = this.handleCommonTable(html, course_selection_column_map, '#DBGrid');
            return courseSelections;
        }

        /**
         * 获得等级考试
         */
        async getRankExam() {
            const { root_url, rank_exam_column_map } = app.config.zf;
            const { ctx } = this;
            const { actions } = ctx.session;
            const rank_exam_url = `${root_url}/${actions['等级考试查询']}`;
            const html = await this._get(rank_exam_url);
            const rankExams = this.handleCommonTable(html, rank_exam_column_map, '#Datagrid1,#DataGrid1');
            return rankExams;
        }

        /**
         * 
         * @param {String} html 
         * @param {Object} map 列名映射
         * @param {String} tableSelector table selector
         */
        handleCommonTable(html, map, tableSelector = '#Datagrid1,#DataGrid1') {
            const entries = Object.entries(map);
            const $ = cheerio.load(html);
            const $table = $(tableSelector);
            const $trs = $table.find('tr');
            const $ths = $trs.eq(0);
            const columns = [];
            $ths.children().each((index, th) => {
                const $this = $(th);
                entries.forEach(item => {
                    if(item[1] === $this.text().trim()) {
                        columns.push(item[0]);
                        return false;
                    }
                })
            })
            const result = [];
            $trs.slice(1).each((index, item) => {
                const $this = $(item);
                const $tds = $this.children();
                const obj = {};

                $tds.each((index, td) => obj[columns[index]] = $(td).text().trim())
                result.push(obj);
            })
            return result;
        }

        // find element id not start with lbxsgrxx;
        handlePersonal(html) {
            const $ = cheerio.load(html);
            const $tds = $(".formlist span:not([id^='lbxsgrxx']),.formlist input:not([id^='lbxsgrxx'])");
            const obj = {};
            $tds.each((index, item) => {
                const $this = $(item);
                obj[$this.attr('id')] = $this.text().trim();
            })
            return obj;
        }

        /**
         * 处理课表页面
         * @param {String} html 
         */
        handleTimetable(html) {
            const $ = cheerio.load(html);
            const $trs = $("#Table1 tr");
            const list = [];
            $trs.slice(1).each((index, tr) => {
                const $this = $(tr);
                const $tds = $this.children();
                const courses = [];
                $tds.each((index, td) => {
                    const $td = $(td);
                    if ($td.attr('align') !== 'Center') return true;
                    courses.push({
                        text: $td.text().trim(),
                        rowspan: $td.attr('rowspan'),
                    }); 
                })
                list.push(courses)
            })
            return list;
        }

        /**
         * 清理过期的验证码图片
         */
        removeExpiredCheckCode() {
            const { check_code_save_dir } = app.config.zf; 
            const filenames = fs.readdirSync(check_code_save_dir);
            filenames.forEach(filename => {
                let time = '';
                if (filename.split('-').length > 1) {
                    time = filename.split('-')[1].split('.')[0];
                } else {
                    return true;
                }
                if (time < Date.now()) {
                    const f = fs.unlinkSync(`${check_code_save_dir}/${filename}`);
                }
            })
        }

        /**
         * get 请求抓取页面
         * @param {String} url 
         * @param {Object} data 
         * @param {String} method 
         */
        async _get(url, data = {}, method = 'GET') {
            const { ctx } = this;
            const { ezproxy, sessionId } = ctx.session;
            const { root_url, action, contentType } = app.config.zf; 
            let resData;
            const resp = await app.curl(encodeURI(url), {
                method,
                data,
                headers: {
                    Cookie: `${sessionId ? `ASP.NET_SessionId=${sessionId};` : ''}${ezproxy ? `ezproxy=${ezproxy};` : ''}`,
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    Referer: `${root_url}`,
                }
            });
            if (resp.headers['content-type']) {
                let charset = '';
                if (resp.headers['content-type'].split('; ').length > 1) {
                    charset = resp.headers['content-type'].split('; ')[1].split('=')[1];
                }
                
                if (charset.toLowerCase() === 'gb2312') {
                    resData = iconv.decode(resp.data,'GB2312').toString();
                } else {
                    resData = resp.data.toString();
                }
            } else {
                resData = resp.data.toString();
            }
            if (resp.status !== 200) {
                if (resp.status === 302 || resp.status === 403) {
                    ctx.throw(403, '请重新登录！');
                } else {
                    ctx.throw(resp.status, '获取数据出错');
                }
            }
            return resData;
        }

        /**
         * post请求抓取页面
         * @param {String} url 
         * @param {Object} data 
         */
        async _post(url, data) {
            return this._get(url, data, 'POST');
        }
    }
    return ZfService;
}