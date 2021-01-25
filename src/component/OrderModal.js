import React, { useState } from "react";
import { ModalPopup } from "./Admin/ModifyModal";
import { Button, Input } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

function OrderModal() {
  const [Amount, setAmount] = useState(1);
  const plusAmount = () => {
    if (Amount < 10) {
      setAmount((pre) => pre + 1);
    } else {
      alert("최대 주문량은 10개 입니다.");
    }
  };
  const minusAmount = () => {
    if (Amount > 1) {
      setAmount((pre) => pre - 1);
    } else {
      alert("최소 주문량은 1개 입니다.");
    }
  };
  return (
    <>
      <ModalPopup>
        <div className="flex-box a-center">
          <Button
            onClick={minusAmount}
            icon={<MinusOutlined />}
            type="default"
          ></Button>
          <Input value={Amount} />
          <Button
            onClick={plusAmount}
            icon={<PlusOutlined />}
            type="default"
          ></Button>
        </div>
      </ModalPopup>
    </>
  );
}

export default OrderModal;
