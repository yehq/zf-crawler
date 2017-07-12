module.exports = {
  schedule: {
    interval: '3m', // 3 分钟间隔
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    const { service } = ctx;
    service.zf.removeExpiredCheckCode();
  },
};