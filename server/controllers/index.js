module.exports.test = async (ctx, next) => {
  const query = ctx.request.query // ?a=b&c=d
  const body = ctx.request.body // ?a=b&c=d // {"a":"b", "c":"d"}
  const params = ctx.params // url path 参数 /:param
  const header = ctx.request.header

  ctx.body = {
    params,
    query,
    body,
    header
  }
}
