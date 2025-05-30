import React, { useState } from 'react';
import { Package, Users, FileText, Truck, CreditCard, Plus, Minus } from 'lucide-react';

const OrdersTrackingSystem = () => {
  // Inventory state
  const [inventory, setInventory] = useState({
    onion: 0,
    potato: 0,
    garlic: 0
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);

  // Form states
  const [containerForm, setContainerForm] = useState({
    onion: 0,
    potato: 0,
    garlic: 0
  });

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    onion: 0,
    potato: 0,
    garlic: 0
  });

  const [activeTab, setActiveTab] = useState('inventory');

  // Handle container creation (add to inventory)
  const handleCreateContainer = () => {
    if (containerForm.onion > 0 || containerForm.potato > 0 || containerForm.garlic > 0) {
      setInventory(prev => ({
        onion: prev.onion + parseInt(containerForm.onion || 0),
        potato: prev.potato + parseInt(containerForm.potato || 0),
        garlic: prev.garlic + parseInt(containerForm.garlic || 0)
      }));
      setContainerForm({ onion: 0, potato: 0, garlic: 0 });
      alert('Container created and added to inventory!');
    }
  };

  // Handle order creation
  const handleCreateOrder = () => {
    const orderQuantities = {
      onion: parseInt(orderForm.onion || 0),
      potato: parseInt(orderForm.potato || 0),
      garlic: parseInt(orderForm.garlic || 0)
    };

    // Check if there's enough inventory
    if (orderQuantities.onion > inventory.onion || 
        orderQuantities.potato > inventory.potato || 
        orderQuantities.garlic > inventory.garlic) {
      alert('Insufficient inventory for this order!');
      return;
    }

    if (!orderForm.customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }

    // Calculate total amount (example pricing)
    const pricing = { onion: 2, potato: 1.5, garlic: 3 };
    const total = (orderQuantities.onion * pricing.onion + 
                  orderQuantities.potato * pricing.potato + 
                  orderQuantities.garlic * pricing.garlic).toFixed(2);

    // Create new order
    const newOrder = {
      id: nextOrderId,
      customerName: orderForm.customerName,
      products: orderQuantities,
      total: total,
      paymentStatus: 'Pending',
      deliveryStatus: 'Sending',
      createdAt: new Date().toLocaleDateString()
    };

    // Deduct from inventory
    setInventory(prev => ({
      onion: prev.onion - orderQuantities.onion,
      potato: prev.potato - orderQuantities.potato,
      garlic: prev.garlic - orderQuantities.garlic
    }));

    // Add order
    setOrders(prev => [...prev, newOrder]);
    setNextOrderId(prev => prev + 1);
    setOrderForm({ customerName: '', onion: 0, potato: 0, garlic: 0 });
    alert(`Order #${nextOrderId} created successfully!`);
  };

  // Update order status
  const updateOrderStatus = (orderId, field, value) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, [field]: value } : order
    ));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Tracking System</h1>
          <p className="text-gray-600">Manage inventory, process orders, and track deliveries</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <TabButton id="inventory" label="Inventory" icon={Package} />
          <TabButton id="orders" label="Create Order" icon={Users} />
          <TabButton id="tracking" label="Order Tracking" icon={FileText} />
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Inventory */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Inventory</h2>
              <div className="space-y-4">
                {Object.entries(inventory).map(([product, quantity]) => (
                  <div key={product} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium capitalize">{product}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{quantity} units</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Container */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Container</h2>
              <div className="space-y-4">
                {Object.keys(inventory).map(product => (
                  <div key={product}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {product} Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={containerForm[product]}
                      onChange={(e) => setContainerForm(prev => ({
                        ...prev,
                        [product]: parseInt(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>
                ))}
                <button
                  onClick={handleCreateContainer}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add to Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Order</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div></div>
              
              {Object.keys(inventory).map(product => (
                <div key={product}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {product} Quantity (Available: {inventory[product]})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={inventory[product]}
                    value={orderForm[product]}
                    onChange={(e) => setOrderForm(prev => ({
                      ...prev,
                      [product]: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateOrder}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText size={18} />
              Create Order & Generate Invoice
            </button>
          </div>
        )}

        {/* Order Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Tracking</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No orders yet. Create your first order to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <p className="text-gray-600">Customer: {order.customerName}</p>
                        <p className="text-gray-600">Date: {order.createdAt}</p>
                        <p className="font-semibold text-green-600">Total: ${order.total}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Products Ordered:</h4>
                        {Object.entries(order.products).map(([product, qty]) => (
                          qty > 0 && (
                            <p key={product} className="text-sm text-gray-600 capitalize">
                              {product}: {qty} units
                            </p>
                          )
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        {/* Delivery Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Truck size={16} className="inline mr-1" />
                            Delivery Status
                          </label>
                          <select
                            value={order.deliveryStatus}
                            onChange={(e) => updateOrderStatus(order.id, 'deliveryStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="Sending">Sending</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                        
                        {/* Payment Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <CreditCard size={16} className="inline mr-1" />
                            Payment Status
                          </label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => updateOrderStatus(order.id, 'paymentStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex gap-4 pt-3 border-t border-gray-100">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.deliveryStatus === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        🚚 {order.deliveryStatus}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'Done' 
                          ? 'bg-green-100 text-green-800' 
                          : order.paymentStatus === 'Cheque'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        💳 {order.paymentStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTrackingSystem;