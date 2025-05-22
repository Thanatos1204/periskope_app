import LoginForm from '@/components/login-form';
import { 
  FiMessageSquare, 
  FiUsers, 
  FiShield, 
  FiZap,
  FiGlobe,
  FiTrendingUp
} from 'react-icons/fi';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Left side - Login form */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="flex items-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg mr-4">
              P
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Periskope Chat</h1>
              <p className="text-sm text-muted-foreground">Business messaging platform</p>
            </div>
          </div>
          
          {/* Welcome section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Welcome back</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sign in to your account to access your business conversations and team communications.
            </p>
          </div>
          
          {/* Login form */}
          <LoginForm />
          
          {/* Footer links */}
          <div className="mt-8 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Business messaging showcase */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-primary via-primary to-green-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-white"></div>
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full border border-white"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 rounded-full border border-white"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full border-2 border-white"></div>
        </div>
        
        {/* Main content */}
        <div className="relative flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="max-w-lg text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              Professional Business Messaging
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Connect with customers, manage team communications, and grow your business with our comprehensive messaging platform.
            </p>
          </div>
          
          {/* Features grid */}
          <div className="grid grid-cols-2 gap-8 max-w-2xl w-full">
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <FiMessageSquare size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Messaging</h3>
              <p className="text-sm text-white/80">
                Instant communication with delivery receipts and read confirmations
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <FiUsers size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
              <p className="text-sm text-white/80">
                Group chats, channels, and organized team communications
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <FiShield size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Enterprise Security</h3>
              <p className="text-sm text-white/80">
                End-to-end encryption and advanced security protocols
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <FiTrendingUp size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Business Analytics</h3>
              <p className="text-sm text-white/80">
                Insights and analytics to optimize your communications
              </p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="mt-12 flex items-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white/80">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">Support</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 right-6 text-white/70 text-sm">
          © 2025 Periskope. All rights reserved.
        </div>
      </div>
    </main>
  );
}