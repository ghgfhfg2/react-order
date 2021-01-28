import React, { useState } from "react";
import { useForm } from "react-hook-form";
import firebase from "../firebase";

function Login() {
  const { register, errors, handleSubmit } = useForm({
    mode: "onChange",
  });
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password);
      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const [InputEmail, setInputEmail] = useState(false);
  const [InputPw, setInputPw] = useState(false);
  const onInputEmail = (e) => {
    setInputEmail(e.target.value);
  };
  const onInputPw = (e) => {
    setInputPw(e.target.value);
  };
  return (
    <>
      <div className="join-form-wrap">
        <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              name="email"
              type="email"
              id="email"
              onChange={onInputEmail}
              ref={register({ required: true, pattern: /^\S+@\S+$/i })}
            />
            <label
              htmlFor="email"
              className={"place-holder " + (InputEmail && "on")}
            >
              <span>이메일</span>
            </label>
          </div>
          <div className="input-box">
            <input
              type="password"
              onChange={onInputPw}
              name="password"
              id="password"
              ref={register({ required: true, minLength: 4 })}
            />
            <label
              htmlFor="password"
              className={"place-holder " + (InputPw && "on")}
            >
              <span>비밀번호</span>
            </label>
            {errors.password && errors.password.type === "required" && (
              <p>비밀번호를 입력해 주세요</p>
            )}
            {errors.password && errors.password.type === "minLength" && (
              <p>비밀번호는 4글자 이상이어야 합니다.</p>
            )}
            {errorFromSubmit && <p>{errorFromSubmit}</p>}
          </div>
          <input type="submit" value="로그인" disabled={loading} />
        </form>
      </div>
    </>
  );
}

export default Login;
