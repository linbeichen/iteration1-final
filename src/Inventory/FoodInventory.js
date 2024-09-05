import React, { useState, useEffect } from 'react';
import './FoodInventory.css';
import EnterItemsManually from './EnterItemsManually';
import ImageUpload from './ImageUpload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import styled from 'styled-components';

// 自定义样式的弹窗组件
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background-color: #f5f5f5;
    border-radius: 15px;
    padding: 20px;
    min-width: 300px;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  font-size: 20px;
  font-weight: bold;
  color: #4a4a4a;
  text-align: center;
`;

const StyledDialogContentText = styled(DialogContentText)`
  color: #666;
  font-size: 16px;
  text-align: center;
  margin: 20px 0;
`;

const StyledButton = styled(Button)`
  color: #4a90e2 !important;
  font-weight: bold !important;
`;

function FoodInventory() {
    const [inventory, setInventory] = useState(() => {
        const savedInventory = localStorage.getItem('inventory');
        return savedInventory ? JSON.parse(savedInventory) : [];
    });
    const [showInputForm, setShowInputForm] = useState(false);
    const [showCaptureForm, setShowCaptureForm] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [recognizedItems, setRecognizedItems] = useState(null);
    const [expiredItems, setExpiredItems] = useState([]); // 用于存储已过期的食品
    const [openDialog, setOpenDialog] = useState(false); // 控制弹窗显示状态

    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) {
            setInventory(JSON.parse(savedInventory));
        }
    }, [reloadTrigger]);

    // 在组件加载时检查过期食品
    useEffect(() => {
        const today = new Date();
        const expired = inventory.filter(item => new Date(item.expiryDate) < today);
        setExpiredItems(expired);

        // 检查是否第一次进入页面
        const isFirstVisit = !localStorage.getItem('hasSeenExpiredItemsPopup');
        if (isFirstVisit && expired.length > 0) {
            setOpenDialog(true); // 打开弹窗
            localStorage.setItem('hasSeenExpiredItemsPopup', 'true'); // 设置已查看状态
        }
    }, [inventory]);

    const addItem = (item) => {
        if (editIndex !== null) {
            const updatedInventory = inventory.map((invItem, index) =>
                index === editIndex ? item : invItem
            );
            setInventory(updatedInventory);
            setEditIndex(null);
        } else {
            setInventory([...inventory, item]);
        }
        setShowInputForm(false);
    };

    const handleEditItem = (index) => {
        setCurrentItem(inventory[index]);
        setEditIndex(index);
        setShowInputForm(true);
    };

    const handleDeleteItem = (index) => {
        // 处理删除逻辑
        const updatedInventory = inventory.filter((_, i) => i !== index);
        setInventory(updatedInventory);
    };

    const handleItemsRecognized = (items) => {
        setRecognizedItems(items);
    };

    const handleSaveAllItems = (items) => {
        items.forEach(item => addItem(item));
        setRecognizedItems(null);
    }

    // 对库存根据过期日期排序
    const sortedInventory = [...inventory].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return (
        <div className="food-inventory">
            <h1 className="title">Food Inventory</h1>
            <div className="buttons">
                <button
                    className="capture-button"
                    onClick={() => setShowCaptureForm(!showCaptureForm)}
                >
                    {showCaptureForm ? 'Hide Capture Form' : 'Capture the receipt image'}
                </button>
                <button
                    className="enter-button"
                    onClick={() => {
                        setShowInputForm(!showInputForm);
                        setCurrentItem(null);
                        setEditIndex(null);
                    }}
                >
                    {showInputForm ? 'Hide Form' : 'Enter items manually'}
                </button>
            </div>
            {showCaptureForm && <ImageUpload onUploadComplete={() => setReloadTrigger(prev => prev + 1)} />}
            {showInputForm && (
                <EnterItemsManually
                    addItem={addItem}
                    initialItem={currentItem}
                />
            )}
            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Days Until Expiry</th>
                        <th>Actions</th>
                        <th>Used</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedInventory.length === 0 ? (
                        <tr>
                            <td colSpan="7">No items in inventory</td>
                        </tr>
                    ) : (
                        sortedInventory.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td>{item.quantity}</td>
                                <td>{item.expiryDate}</td>
                                <td>{item.daysUntilExpiry}</td>
                                <td>
                                    <button
                                        className="action-button"
                                        onClick={() => handleEditItem(index)}
                                    >
                                        View/Edit
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={item.used}
                                        onChange={() => handleDeleteItem(index)} // 勾选后删除该行
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* 自定义样式的弹窗组件 */}
            <StyledDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <StyledDialogTitle>ecopantry says</StyledDialogTitle>
                <DialogContent>
                    <StyledDialogContentText>
                        Expired items: {expiredItems.map(item => item.name).join(', ')}
                    </StyledDialogContentText>
                </DialogContent>
                <DialogActions>
                    <StyledButton onClick={() => setOpenDialog(false)} color="primary">
                        OK
                    </StyledButton>
                </DialogActions>
            </StyledDialog>
        </div>
    );
}

export default FoodInventory;
