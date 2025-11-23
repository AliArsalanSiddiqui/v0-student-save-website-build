export default function EmailVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="StudentSave" className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gradient">Verify Your Email</h1>
          </div>

          <p className="text-muted mb-6">
            We've sent a verification email to your inbox. Please check your email and click the verification link to
            confirm your account.
          </p>

          <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            Check your email to verify your account
          </div>

          <p className="text-muted text-sm">
            Didn't receive an email? Check your spam folder or wait a few moments and refresh the page.
          </p>
        </div>
      </div>
    </div>
  )
}
