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
      const { check_code, username, password } = ctx.request.body;
      await service.zf.login(check_code, username, password);
      await service.zf.getMain();
      ctx.body = {};
    }

    // xnd 学年 example：2017-2018
    // xqd 学期 example: 1
    async timetable() {
      const { ctx, service } = this;
      const { xnd, xqd } = ctx.query;
      const timetable = await service.zf.getTimetable({
        xnd,
        xqd
      });
      ctx.body = {
        timetable
      };
    }

    async main() {
      const { ctx, service } = this;
      const result = await service.zf.getMain();
      ctx.body = result;
    }

    // ddlXN 学年 example：2017-2018
    // ddlXQ 学期 example：1
    async grade() {
      const { ctx, service } = this;
      const { ddlXN, ddlXQ } = ctx.query;
      const grades = await service.zf.getGrade({
        ddlXN,
        ddlXQ
      });
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

    // xnd 学年 example：2017-2018
    // xqd 学期 example: 1
    async exam() {
      const { ctx, service } = this;
      const { xnd, xqd } = ctx.query;
      const exams = await service.zf.getExam({
        xnd,
        xqd
      });
      ctx.body = {
        exams
      };
    }

    // ddlXN 学年 example：2017-2018
    // ddlXQ 学期 example：1
    async courseSelection() {
      const { ctx, service } = this;
      const { ddlXN, ddlXQ } = ctx.query;
      const courseSelections = await service.zf.getCourseSelection({
        ddlXN,
        ddlXQ
      });
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
