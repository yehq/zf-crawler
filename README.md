# zf-crawler 
正方教务系统爬虫
======

系统采用node开发，使用了 egg + cheerio

### QuickStart
```shell
$ npm install
$ npm start
$ open http://localhost:7001
```

### Development
```shell
$ npm install
$ npm run dev
$ open http://localhost:7001
```

### 试用范围
1. 浙江科技学院
2. 金陵科技学院

note: 通过修改配置文件理论上可以适配大部分正方教务系统系统，但没有测试过不敢保证！！！

### api
```
1. 测试接口的页面
GET  /                               
```
```
2. 校外访问登录接口
POST /zf/off_campus_authentication   
requestBody                  
{
  "username": "",
  "password": ""
}

note: 没有校外访问可以跳过
```
```
3. 获得教务系统登录的验证码
GET  /zf/check_code                  
responseBody 
{
  "check_code_url": ""
}
note: 在教务系统登录之前需要先获取验证码，需要校外访问的必须在校外访问成功了才能获取
```
```
4.教务系统登录的接口
POST /zf/login                       
requestBody
{
  "username": "",
  "password": "",
  "check_code": ""
}
note: 要手动填写验证码
```

```
5. 主页的html代码
GET  /zf/main                        
```
```
6. 课表
GET  /zf/timetable                   
responseBody
{
  "timetable": [
    [{ "text": "", rowspan: 1 }, {}, {}, {}, {}, {}, {}],
    [{ "text": "", rowspan: 2 }, {}, {}, {}, {}, {}, {}],
    [{ "text": "", rowspan: 3 }, {}, {}, {}, {}, {}, {}],
  ]
}
```
```
6. 成绩
GET  /zf/grade                       
responseBody
{
  "grades": []
}
```
```
7. 个人信息
GET  /zf/personal                    
responseBody
{
  "personal": []
}
```
```
8. 考试安排
GET  /zf/exam                        
responseBody
{
  "exams": []
}
```
```
9. 选课
GET  /zf/course_selection            
responseBody
{
  "course_selections": []
}
```
```
10. 等级考试安排
GET  /zf/rank_exam                   
responseBody
{
  "rank_exams": []
}
```

### 错误返回格式
```
{
  "error": {
    "message": ""
  }
}
```

### 自定义config
./config/config.default.js
```
zf: {
      //校外访问 以zust(浙江科技学院)为例，没有可不填， 没测试过别的学校的校外访问，应该不行！！
      off_campus_authentication_url: 'https://ez.zust.edu.cn/login', 
      
      //学校路径 
      root_url: 'http://jwxt.zust.edu.cn.ez.zust.edu.cn',
      //登录的操作
      action: {
        check_code: 'CheckCode.aspx',
        login: 'default2.aspx',
        main: 'xs_main.aspx',
      },

      //zust 自定义登录参数名，不同学校的登录名参数有所不同
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
```
