import LoginForm from '@/components/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold mr-3">
              P
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Periskope Chat</h1>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to Periskope</h2>
            <p className="text-gray-600">Enter your email to receive a login code</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By signing in, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Decorative background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="bg-white bg-opacity-10 p-8 rounded-xl max-w-lg text-black">
            <h2 className="text-2xl font-bold mb-4">Connect with your team in real-time</h2>
            <p className="mb-6">Periskope Chat helps your team collaborate efficiently with organized conversations, file sharing, and powerful search capabilities.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-5a1 1 0 00-1 1v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Real-time messaging</h3>
                  <p className="text-sm opacity-80">Instant communication with delivery receipts</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">File sharing</h3>
                  <p className="text-sm opacity-80">Share documents, images and more</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Group chats</h3>
                  <p className="text-sm opacity-80">Collaborate with your entire team</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Smart search</h3>
                  <p className="text-sm opacity-80">Find messages and files instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 text-white text-sm opacity-70">
          © 2025 Periskope. All rights reserved.
        </div>
      </div>
    </main>
  );
}