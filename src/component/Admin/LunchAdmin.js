import React from 'react';
import { Input } from 'antd';

function LunchAdmin() {

  const onSubmit = async (data) => {
    try {
      let arr;
      arr = data.split(',');
      firebase.database().ref('lunch/item')
      .set({
        arr
      })

    }catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
        <Input name="item" />
      </form>
    </>
  )
}

export default LunchAdmin
