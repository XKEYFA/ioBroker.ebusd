var events  = require('events');
var net     = require('net');
var util    = require('util');

// define a constructor (object) and inherit EventEmitter functions
function Telnet(options) {
    if (!(this instanceof Telnet)) return new Telnet();

    var that = this;
    this.params = {
        port:       options.port || 7072,
        host:       options.host || '127.0.0.1',
        password:   options.password || '',
        _reconnect: options.reconnectTimeout || 10000,
        _readOnly:  options.readOnly || false,
        prompt:     options.prompt || 'fhem'
    };
    this.connectTimeout = null;
    this.requestCB  = null;
    this.result     = '';
    this.ready      = false;
    this.shutdown   = false;
    
    var lastSendCommand = '';

    this.connect = function () {
        var buffer = '';
        that.ready = false;

        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        this.telnetSocket = net.createConnection(this.params, function () {
            // write password
            if (that.params.password) {
                that.telnetSocket.write(that.params.password + '\n');
                that.telnetSocket.write('\n\n');
            } else {
                that.telnetSocket.write('\n\n\n');
            }
        });

        this.telnetSocket.on('error', function (error) {
            buffer = null;
            if (that.telnetSocket) {
                that.emit('error', error);
                that.telnetSocket.destroy();
                that.telnetSocket = null;
            }
            if (!that.shutdown && !that.connectTimeout) that.connectTimeout = setTimeout(that.connect.bind(that), that.params._reconnect);
        });

        this.telnetSocket.on('end', function () {
            buffer = null;
            if (that.telnetSocket) {
                that.telnetSocket.destroy();
                that.telnetSocket = null;
                that.emit('end');
            }
            if (!that.shutdown && !that.connectTimeout) that.connectTimeout = setTimeout(that.connect.bind(that), that.params._reconnect);
        });

        this.telnetSocket.on('close', function () {
            buffer = null;
            if (that.telnetSocket) {
                that.telnetSocket.destroy();
                that.telnetSocket = null;
                that.emit('close');
            }
            if (!that.shutdown && !that.connectTimeout) that.connectTimeout = setTimeout(that.connect.bind(that), that.params._reconnect);
        });

		var countEmpty= 0;
	
        this.telnetSocket.on('data', function (data) {
            
            if (that.shutdown) return;
			
			//countEmpty = 0;
			
            buffer += data.toString();
            var lines = buffer.split('\n');
            
            buffer = lines[lines.length - 1];
            lines.pop();
            for (var line = 0; line < lines.length; line++) {
                if (that.ready && lines[line] === that.params.prompt + '') continue;

				//that.emit('log', "Line "+line+": " + lines[line] + '');
                // if event connection
                if (that.params._readOnly) {
                    // if no prompt yet received
                    if (!that.ready) {
                        // wait for prompt 
                        if (lines[line] === that.params.prompt + '') {
                            that.ready = true;
                            // send "inform" command
                            setTimeout(function () {
                                that.telnetSocket.write('inform on\n');
                            }, 100);
                        }
                    } else {
                        // emit command 
                        that.emit('data', lines[line]);
                    }
                } else {
                    // if command connection
                    // if no prompt yet received
                    if (!that.ready) {
                        // wait for prompt 
						that.ready = true;
						that.emit('ready');
                    } else {
                    	
                    // command finished
                    	if (lines[line].trim() ===  ''){
                    		countEmpty++;
                   		}
                   		//that.emit('log', "CountEmpty: " + countEmpty + '');
						if ((lines[line].trim() ===  '' && countEmpty > 1) || (lines[line].trim() ===  '' && countEmpty > 0 && !(lastSendCommand.trim() === 'i')) ) {
							//that.emit('log', "CountEmpty: " + countEmpty + '> 1');
							//that.emit('log', "RequestCB: " + that.requestCB );
							if (that.requestCB) {
								countEmpty= 0;
								//that.emit('log', "send Result back");
								var err = false;
								if (that.result.indexOf("ERR:") > -1)
								{
									err = true;
								}
								that.requestCB(null, that.result, err);
								that.result    = '';
								that.requestCB = null;
							}
						} else if (that.requestCB && lines[line].trim()) {
							//that.emit('log', "Line___" + lines[line]);
							that.result += lines[line] + '\n';
						} // else ignore
                    }
                }
            }
            //that.emit('log', 'for end');
            
            // if prompt
            if (buffer === that.params.prompt + '') {
                buffer = '';
                if (that.params._readOnly) {
                    if (!that.ready) {
                        that.ready = true;
                        setTimeout(function () {
                            that.telnetSocket.write('inform on\n');
                        }, 100);
                    }
                } else {
                    if (!that.ready) {
                        that.ready = true;
                        that.emit('ready');
                    } else if (that.requestCB) {
                        // command finished
                        that.requestCB(null, that.result);
                        that.result    = '';
                        that.requestCB = null;
                    }
                }
            }
        });
    };
    
    this.send = function (cmd, cb) {
        if (!cmd) return;
        if (cmd[cmd.length - 1] !== '\n') cmd += '\n';

        if (that.telnetSocket) {
        	//that.emit('log', 'send: ' + cmd);
        	lastSendCommand = cmd;
            that.telnetSocket.write(cmd);
        } else {
            that.emit('error', 'Socket not exists');
        }

        if (cb) {
            this.result = null;
            this.result = '';
            this.requestCB = cb;
        } 
    };

    this.destroy = function () {
        this.shutdown = true;
        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        if (this.telnetSocket) {
            this.telnetSocket.destroy();
            this.telnetSocket = null;
        }
    };
    
    this.isReady = function () {
        return this.ready;
    };

    this.isCommandRunning = function () {
        return !!this.requestCB;
    };

    this.connect();

    return this;
}

util.inherits(Telnet, events.EventEmitter);

module.exports = Telnet;

