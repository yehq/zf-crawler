'use strict';
module.exports = appInfo => {
  const config = {

    // 加载 errorHandler 中间件
    middleware: ['errorHandler'],

    errorHandler: {
      match: '/',
    },

    cors: {
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    },

    keys: appInfo.name + '_1490928873243_4696',

    security: {
      csrf: false,
      domainWhiteList: ['localhost', 'http://localhost:8000'],
    },

    view: {
      mapping: {
        '.ejs': 'ejs',
      },
    },

    zf: {
      //校外访问
      off_campus_authentication_url: 'https://ez.zust.edu.cn/login', 
      //学校路径
      root_url: 'http://jwxt.zust.edu.cn.ez.zust.edu.cn',//zust
      action: {
        check_code: 'CheckCode.aspx',
        login: 'default2.aspx',
        main: 'xs_main.aspx',
      },

      //zust 登录参数
      login_params: {
        viewstate: '__VIEWSTATE',
        username: 'TextBox1', 
        password: 'TextBox2',
        check_code: 'TextBox3',
        login_type: 'RadioButtonList1'
      }, 

      //成绩查询的列名映射
      grade_column_map: {
        year: '学年',
        term: '学期',
        code: '课程代码',
        name: '课程名称',
        nature: '课程性质',
        ascription: '课程归属',
        credit: '学分',
        grade_point: '绩点',
        final_score: '期末成绩',
        score: '成绩',
        minor_mark: '辅修标记',
        makeup_score: '补考成绩',
        retake_score: '重修成绩',
        college_name: '学院名称',
        rebuild_mark: '重修标记',
      },

      //考试查询的列名映射
      exam_column_map: {
        course_code: '选课课号',
        course_name: '课程名称',
        name: '姓名',
        time: '考试时间',
        place: '考试地点',
        form: '考试形式',
        seat_number: '座位号',
        campus: '校区',
      },

      //学生选课情况的列名映射
      course_selection_column_map: {
        code: '选课课号',
        name: '课程名称',
        nature: '课程性质',
        isChose: '是否选课',
        teacher_name: '教师姓名',
        credit: '学分',
        weekly_hours: '周学时',
        class_time: '上课时间',
        class_place: '上课地点',
        teaching_material: '教材',
        reading_mark: '修读标记',
        teaching_plan_upload_number: '授课计划上传次数',
        teaching_plan_latest_upload_time: '授课计划最近上传时间',
        teaching_plan_file_name: '授课计划上传文件名',
      },

      //等级考试查询的列名映射
      rank_exam_column_map: {
        year: '学年',
        term: '学期',
        name: '等级考试名称',
        ticket_number: '准考证号',
        exam_time: '考试日期',
        score: '成绩',
        hearing_score: '听力成绩',
        reading_score: '阅读成绩',
        writing_score: '写作成绩',
        comprehensive_score: '综合成绩',
      }
    }
  };

  return config;
};
