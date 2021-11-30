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
