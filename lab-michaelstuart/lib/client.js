let clientPool = [];

module.exports = class Client {
  constructor(socket) {
    this.socket = socket;
    this.nickname = `user-${Math.floor(Math.random() * 10000)}`;
  }

  findUser(input) {
    const index = clientPool.indexOf(v => v.nickname === input);
    return index === -1 ? null : clientPool[index];
  }

  setNickname(input) {
    if (this.findUser(input)) {
      this.socket.write('nickname is taken');
    } else {
      this.removeUser(true);
      this.nickname = input;
      this.addUser(true);
      this.socket.write(`nickname updated to ${input}`);
    }
  }

  announce(message) {
    clientPool.forEach(user => {
      user.nickname !== this.nickname && user.socket.write(message);
    });
  }

  whisper(userName, message) {
    const user = this.findUser(userName, clientPool);
    if (user) {
      user.socket.write(message);
    } else {
      this.socket.write('user not found');
    }
  }

  addUser(option) {
    clientPool = [...clientPool, this];
    !option && this.announce(`${this.nickname} connected`);
  }

  removeUser(option) {
    clientPool.filter(user => user.nickname !== this.nickname);
    !option && this.announce(`${this.nickname} disconnected`);
    !option && this.socket.end();
  }

  parseBuffer(buffer) {
    const content = buffer.toString().trim();
    const wack = content.split(' ')[0] || [];
    const arg2 = content.split(' ')[1] || [];
    const arg3 = content.substr(wack.length + arg2.length + 2);
    const name = content.substr(wack.length + 1);
    return { wack, arg2, arg3, name };
  }

  wackRouter(buffer) {
    const { wack, arg2, arg3, name } = this.parseBuffer(buffer);
    switch(wack) {
      case '/nick':
        this.setNickname(name);
        break;
      case '/whisper':
        this.whisper(arg2, arg3);
        break;
      case '/quit':
        this.removeUser();
        break;
      case '/troll':
        [...Array(Number(arg2))].forEach(this.announce(arg3));
        break;
      default:
        this.announce(buffer.toString().trim())
    }
  }
};
