'use strict';

module.exports = app => {
  app.get('/', 'zf.index');
  app.post('/zf/off_campus_authentication', 'zf.offCampusAuthentication');
  app.get('/zf/check_code', 'zf.checkCode');
  app.post('/zf/login', 'zf.login');
  app.get('/zf/main', 'zf.main');
  app.get('/zf/timetable', 'zf.timetable');
  app.get('/zf/grade', 'zf.grade');
  app.get('/zf/personal', 'zf.personal');
  app.get('/zf/exam', 'zf.exam');
  app.get('/zf/course_selection', 'zf.courseSelection');
  app.get('/zf/rank_exam', 'zf.rankExam');
};
