module.exports = () => {
  return function* (next) {
    try {
      yield next;
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      this.app.emit('error', err, this);
      const status = err.status || 500;
      const error = {
        message: err.message,
        type: err.type,
        code: err.code,
      }
      this.body = { error };
      if (status === 422) {
        this.body.detail = err.errors;
      }
      this.status = status > 0 ? status : 500;
    }
  };
};