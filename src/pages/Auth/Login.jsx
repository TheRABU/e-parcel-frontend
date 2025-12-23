import { Link, useNavigate } from "react-router";
import imgBackground from "../../assets/login.svg";
import { axiosInstance } from "../../lib/axios";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    const loginData = {
      email,
      password,
    };

    try {
      const result = await axiosInstance.post("/auth/login", loginData);
      console.log("Login successful:", result.data);
      if (result.data) {
        alert("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-center mt-10">Login Page</h1>

          <form onSubmit={handleLogin}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mx-auto py-10 mt-6">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                name="email"
                placeholder="Email"
              />

              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                name="password"
                placeholder="Password"
              />

              <button
                type="submit"
                className="bg-red-500 text-white mt-4 py-2 w-full rounded-4xl font-semibold"
              >
                Login
              </button>

              <span className="font-semibold">
                New here ?{" "}
                <Link className="underline" to="/register">
                  Register now
                </Link>
              </span>
            </fieldset>
          </form>
        </div>
        <div className="min-h-screen hidden md:block md:w-1/2 overflow-hidden">
          <img className="w-full h-full" src={imgBackground} alt="" />
        </div>
      </div>
    </>
  );
};

export default Login;
