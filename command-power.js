//TODO
//fix WOL incomplete table
//remove the use of sudo

var bravia = require('./lib');

bravia('10.0.1.14', 'ec:0e:c4:51:3e:34', function(client) {
  // console.log('c');
  // List available commands
  // run this command to test if tv is on
  client.getCommandNames(function(list) {
    // console.log(list);

    if(list == 'error' || list == 'error, id') {
      console.log('turning tv on');
      client.exec('PowerOn');

      //todo change to hdmi1
      // client.exec('PowerOn');
      client.exec('HDMI3');

    } else {
      console.log('turning tv off');
      // client.exec('VolumeUp');
      // client.exec('HDMI3');
      client.exec('PowerOff');
    }
    // process.exit();
  });

  /*/run this command to test if tv is on
  client.getCommandList(function(response) {
    // console.log(response);
    // console.log('rrr');

    if(response.error) {
      //error, most likely the tv is not on or the ip is incorrect
      console.log('turning tv on');
      // client.exec('PowerOn');
      process.exit();

    } else {
      // if(response[1] == 'not power-on') {
      //   console.log('power off');
      // }

      console.log('turning tv off');
      // calling power off here because if the tv is on, it will succeed and power off the tv, otherwise if the command failed, it will turn the tv on
      // client.exec('PowerOff');


      // client.exec('VolumeDown'); 
      // client.exec('VolumeUp');
      // client.exec('PowerOn'); 
      process.exit();
        
    }

  });*/
  
});