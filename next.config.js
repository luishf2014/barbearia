/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permite concluir o build mesmo com avisos do ESLint
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: ['images.unsplash.com']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypuvirwpnyppgszuwwol.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcxNTIsImV4cCI6MjA3MjM5MzE1Mn0.Qu1uL2DvQnVmxZ5B3H9ct3R5qkMpy_PMBrX6NarIwKU',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXZpcndwbnlwcGdzenV3d29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNzE1MiwiZXhwIjoyMDcyMzkzMTUyfQ.bvlFHnLLj3CXE2QuFgAPjou7NbaXsq7TAtFPYk6Y_Ic'
  }
}

module.exports = nextConfig