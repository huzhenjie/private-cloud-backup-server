const OS = require('os')

module.exports.getIPAddress = () => {
  const interfaces = OS.networkInterfaces();

  const filter = interfaceItem => {
    return interfaceItem.family === 'IPv4' && interfaceItem.address !== '127.0.0.1' && !interfaceItem.internal;
  };
  const interfaceKey = Object.keys(interfaces).find(key => {
    return interfaces[key].some(filter);
  });
  if (interfaceKey) {
    return interfaces[interfaceKey].find(filter).address;
  }

  // for (var devName in interfaces) {
  //     var iface = interfaces[devName];
  //     for (var i = 0; i < iface.length; i++) {
  //         var alias = iface[i];
  //         if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
  //             return alias.address;
  //         }
  //     }
  // }
  return null;
};

module.exports.fmtDatetime = (ts, fmt) => {
  if (!ts || ts <= 0) {
    return '-'
  }
  if (ts < 999999999999) {
    ts *= 1000
  }
  const date = new Date(ts)
  if (!fmt) {
    fmt = 'yyyy-MM-dd hh:mm:ss'
  }
  const month = date.getMonth()
  const o = {
    'M+': month + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((month + 3) / 3),
    'S': date.getMilliseconds(),
    'W': '周' + '日一二三四五六'[date.getDay()]
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  return fmt
}
