import React from 'react'

function Test() {
  return (
    <>
      <form action="https://metree.co.kr/_sys/_xml/order_kakao.php">
        <input type="text" name="goods_name" />
        <input type="text" name="order_tel" />
        <input type="submit" />
      </form>
    </>
  )
}

export default Test
