import esbuildServe from 'esbuild-serve'

esbuildServe(
  {
    define: { 'process.env.NODE_ENV': '"development"' },
    entryPoints: ['./src/index.js'],
    bundle: true,
    outfile: './build/index.js',
  },
  {
    // serve options (optional)
    port: 7000,
    root: '.',
  }
)
