const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Введите пароль администратора: ', (password) => {
  if (!password || password.length < 8) {
    console.error('Пароль должен быть не короче 8 символов.');
    process.exit(1);
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}`);
  console.log(`ADMIN_SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
  rl.close();
});
