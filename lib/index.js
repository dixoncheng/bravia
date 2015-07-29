//TODO timeout handling
//skip sudo?


var request = require('request'),
    readline = require('readline'),
    uuid = require('node-uuid'),
    FileCookieStore = require('tough-cookie-filestore'),
    wol = require('wake_on_lan');
    // arp = require('arpjs');


var Bravia = function(ip, mac, callback) {

  var that = this;

  this.ip = ip;
  this.device = ip;
  this.mac = mac;
  this.nickname = 'bravia-control';
  this.uuid = uuid.v1();
  this.cookieJar = request.jar(new FileCookieStore('cookies.json'));
  this.commands = {};

  if(callback !== undefined) {
    this.auth(function() {
      callback(that);
    });
  }

};

Bravia.prototype.exec = function(command) {

  var that = this;

  if(command === 'PowerOn') {
    return this.wake();
  }

  this.auth(function() {
    that.getCommandCode(command, function(code) {
      // code = 'AAAAAgAAABoAAABaAw==';
      if(command == 'HDMI3') { //add support for HDMI3
        code = 'AAAAAgAAABoAAABcAw==';
      }
      that.makeCommandRequest(code);
    });
  });

};

Bravia.prototype.wake = function() {
  wol.wake(this.mac);
  // var that = this;

  // arp.table(function(err, table) {

  //   // console.log(table);
  //   for(var i in table) {
  //     if(table[i].ip === that.ip) {

  //       //Fix for mac address part with leading 0
  //       var mac = (table[i].mac).split(':');
  //       for(var j in mac) {
  //         if(mac[j].length == 1) {
  //           mac[j] = '0' + mac[j];
  //         }
  //       }
  //       // wol.wake(table[i].mac);
  //       // console.log( 'MAC' );
  //       // console.log( mac.join(':') );

  //       mac = mac.join(':');
  //       if(mac == 'incomplete') {
  //         mac = 'ec:e:c4:51:3e:34'; //todo get previous saved mac
  //       }
  //       wol.wake(mac);
  //     }
  //   }
  // });
  // process.exit();
  
};

Bravia.prototype.getCommandList = function(callback) {

  var that = this;

  if(Object.keys(this.commands).length > 0) {
    if(callback !== undefined) {
      callback(this.commands); 
    } 
    return;
  }

  this.request({ 
    path: '/sony/system', 
    json: {
      'id': 20,
      'method': 'getRemoteControllerInfo',
      'version': '1.0', 
      'params': [],
    },
    timeout: 2000

  }, function(response) {

// console.log(1);
    // console.log(response);

    //timeout
    // if(response && response.code && response.code == 'ETIMEDOUT') {
    //   console.log('a');
    //   //if timeout, try turning the tv on
    //   callback(response.error);
    // }


    //has response but error
    if(response && response.error) { //} && response.error[1] == 'not power-on' ) {
      
      
      // console.log('e');
      // console.log(response);
      // that.exec('PowerOn'); 
      // that.wake();

      callback(response);
      // return;
      // return response.error;

    }
    
    if(response && response.result !== undefined && Object.keys(response.result).length === 2) {
      
      var list = response.result[1].map(function(item) {
        var i = {};
        i[item.name] = item.value;
        return i;
      });

      var commands = {};
      commands.PowerOn = '';

      for(var i in list) {
        for(var key in list[i]) {
          commands[key] = list[i][key];
        }
      }

      that.commands = commands;

      if(callback !== undefined) {
        callback(commands); 
      } 
    }
    
  });
  
};

Bravia.prototype.getCommandNames = function(callback) {

  this.getCommandList(function(list) {
    callback(Object.keys(list).join(', '));
  });

};

Bravia.prototype.makeCommandRequest = function(code, callback) {

  var body = '<?xml version="1.0"?>' + 
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' + 
      '<s:Body>' + 
        '<u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">' + 
          '<IRCCCode>' + code +'</IRCCCode>' + 
        '</u:X_SendIRCC>' + 
      '</s:Body>' + 
    '</s:Envelope>';

  this.request({
    path: '/sony/IRCC',
    body: body,
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      'SOAPACTION': '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"'
    }
  }, function(response) {
    // console.log(response);
    process.exit();

  });

  // console.log(code);

};

Bravia.prototype.makeAuthRequest = function(callback, headers) {
  
  this.request({
    path: '/sony/accessControl', 
    json: {
      method: 'actRegister',
      id: 8,
      version: '1.0',
      params: [
        {
          clientid: this.device + ':' + this.uuid,
          nickname: this.nickname + ' (' + this.device + ')',
          level: 'private'
        },
        [{
          value: 'yes',
          function: 'WOL'
        }]
      ]
    },
    headers: headers 
  }, function(response) {
    // console.log(response);

    if(callback !== undefined) {
      callback(response);
    }
  });

};

Bravia.prototype.hasCookie = function() {
  // console.log(this.ip);
  // console.log( this.cookieJar );

  // console.log( this.cookieJar._jar.store.idx[this.ip]['/sony/'].auth );

  // console.log( this.cookieJar.getCookieString('http://' + this.ip + '/sony') );

  // console.log( this.cookieJar.getCookies('http://' + this.ip + '/sony') );
  // console.log( this.cookieJar.getCookies('' + this.ip + '/sony/') );
  // console.log( this.cookieJar.getCookies('store') );
  // console.log( this.cookieJar.getCookies('idx') );
  // console.log( this.cookieJar.getCookies('http://' + this.ip + '/sony') );
  // console.log( this.cookieJar.getCookies('http://' + this.ip + '') );

  // this.cookieJar.findCookie();
  return this.cookieJar._jar.store.idx[this.ip];
  // return this.cookieJar; //.getCookies('http://' + this.ip + '/sony/').length > 0;
};

Bravia.prototype.auth = function(callback) {

  var that = this;

  if(!this.hasCookie()) {
    
    this.makeAuthRequest();

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Please enter the 4-digit code shown on your TV: ', function(challenge) {
      
      that.makeAuthRequest(function(response) {
        callback();
      }, {
        Authorization: 'Basic ' + new Buffer(':' + challenge).toString('base64')
      });

      rl.close();
    });
  } else {
    if(callback !== undefined) {
      callback(); 
    } 
  }

};

Bravia.prototype.getCommandCode = function(command, callback) {

  this.getCommandList(function(list) {
    if(list[command] !== undefined && callback !== undefined) {
      callback(list[command]);
    }
  });

};

Bravia.prototype.request = function(options, callback) {

  options.url = 'http://' + this.ip + options.path;
  options.jar = this.cookieJar;
  
  // if(this.cookieJar._jar.store.idx[this.ip]) {
  if(this.hasCookie()) {
    var cookie = this.cookieJar._jar.store.idx[this.ip]['/sony/'].auth;  
    // options.headers = {'Cookie': 'auth=1d71ba3d83d2da53f1fda3763431b1923d77cd5c20ac96caad0782c52f588082'};
    options.headers = {'Cookie': cookie};
  }

  request.post(options, function(error, response, body) {
    
    if(error) {
      if(callback !== undefined) {
        callback({error: error});
      }
      // console.error(error);
      // console.log(error);
      // console.log(error.code);
      // if(error.code == 'ETIMEDOUT') {
      //   console.log('a');
      //   //if timeout, try turning the tv on
      //   return error;


      // }

    } else if(callback !== undefined) {
      callback(body);
    }
  });

};

module.exports = function(ip, mac, callback) {
  return new Bravia(ip, mac, callback);
};
