import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '127.0.0.1',
  port: 5433,
  database: 'taxime_inventory',
  user: 'postgres',
  password: 'postgres',
});

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT current_database(), current_user');
  })
  .then(result => {
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    return client.end();
  })
  .then(() => {
    console.log('✅ Connection test passed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
