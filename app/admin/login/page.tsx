import { login } from "./actions";
import SubmitButton from "./SubmitButton";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-4 mx-auto">
          🔐
        </div>
        <h1 className="text-[18px] font-bold text-gray-900 text-center">Admin login</h1>
        <p className="text-[12px] text-gray-400 text-center mt-1 mb-5">
          Sign in to manage the store
        </p>

        <form action={login} className="flex flex-col gap-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            autoFocus
            autoComplete="username"
            required
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {sp.error && (
            <p className="text-[12px] text-red-500 font-medium">Wrong username or password</p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
