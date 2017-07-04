'use strict';

// const username = '1140299340';
// const password = '331081199602134011';
module.exports = app => {
  class ZfController extends app.Controller {
    async index() {
      await this.ctx.render('index.ejs');
    }

    async offCampusAuthentication() {
      const { ctx, service } = this;
      const { username, password } = ctx.request.body;
      ctx.session.username = username;
      ctx.session.password = password;
      await service.zf.offCampusAuthentication();
      ctx.body = {};
    }

    async checkCode() {
      const { ctx, service } = this;
      await service.zf.getLoginParams();
      const check_code_url = await service.zf.fetchCheckCodeImg();
      ctx.body = {
        check_code_url
      };
    }

    async login() {
      const { ctx, service } = this;
      const { checkCode, username, password } = ctx.request.body;
      const result = await service.zf.login(checkCode, username, password);
      await service.zf.getMain();
      ctx.body = result;
    }

    async timetable() {
      const { ctx, service } = this;
      const timetable = await service.zf.getTimetable();
      ctx.body = {
        timetable
      };
    }

    async main() {
      const { ctx, service } = this;
      const result = await service.zf.getMain();
      ctx.body = result;
    }

    async grade() {
      const { ctx, service } = this;
      const grades = await service.zf.getGrade();
      ctx.body = {
        grades
      };
    }

    async personal() {
      const { ctx, service } = this;
      const personal = await service.zf.getPersonal();
      ctx.body = {
        personal
      };
    }

    async exam() {
      const { ctx, service } = this;
      const exams = await service.zf.getExam();
      ctx.body = {
        exams
      };
    }

    async courseSelection() {
      const { ctx, service } = this;
      const courseSelections = await service.zf.getCourseSelection();
      ctx.body = {
        course_selections: courseSelections
      };
    }

    async rankExam() {
      const { ctx, service } = this;
      const rankExams = await service.zf.getRankExam();
      ctx.body = {
        rank_exams: rankExams
      };
    }
  }
  return ZfController;
};
