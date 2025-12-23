import { Link, useNavigate } from "react-router";
import imgBackground from "../../assets/login.svg";
import { axiosInstance } from "../../lib/axios";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const registerData = {
      name,
      email,
      phone,
      password,
    };
    try {
      const result = await axiosInstance.post("/auth/register", registerData);
      console.log("Registration successful:", result.data);
      if (result.data) {
        alert("Registration successful! Please login.");
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-center mt-10">
            Register Page
          </h1>

          <form onSubmit={handleRegister}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mx-auto py-10 mt-6">
              <label className="label">Name</label>
              <input type="text" className="input" placeholder="Name" />

              <label className="label">Email</label>
              <input type="email" className="input" placeholder="Email" />
              <label className="label">Phone</label>
              <input type="tel" className="input" placeholder="Phone" />

              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Password" />

              <button
                type="submit"
                className="bg-red-500 text-white mt-4 py-2 w-full rounded-4xl font-semibold"
              >
                Register
              </button>

              <span className="font-semibold">
                Already have account{" "}
                <Link className="underline" to="/login">
                  Login
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

export default Register;
