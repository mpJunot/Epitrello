export default () => ({
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/epitrello',
  },
});

