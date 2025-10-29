import { useState } from 'react';
import { Button } from './UI/Button2';
import axiosInstance from '../lib/axiosInstance';
import { useUser } from '../lib/AuthContext';

const plans = [
  { type: 'Bronze', pricePaise: 1000, priceText: '₹10', minutes: 7, desc: 'Watch up to 7 minutes' },
  { type: 'Silver', pricePaise: 5000, priceText: '₹50', minutes: 10, desc: 'Watch up to 10 minutes' },
  { type: 'Gold', pricePaise: 10000, priceText: '₹100', minutes: 0, desc: 'Unlimited watching' },
];

const UpgradePlanModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, login } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const startCheckout = async (plan) => {
    try {
      if (!user?._id) {
        alert('Please sign in to purchase a plan');
        return;
      }
      setLoading(true);
      const { data: keyData } = await axiosInstance.get(`/payment/key`);
      const { data: order } = await axiosInstance.post(`/payment/order`, { amount: plan.pricePaise, planType: plan.type });

      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: order.currency,
        name: 'YourTube Plan Upgrade',
        description: `${plan.type} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await axiosInstance.post(`/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              planType: plan.type,
              amount: plan.pricePaise,
            });
            const planDurationLimit = plan.minutes;
            const planAmount = plan.pricePaise;
            const planType = plan.type;
            const paymentStatus = 'success';
            login({ ...user, planType, planAmount, planDurationLimit, paymentStatus, isPremium: planType === 'Gold' });
            onSuccess?.(planType);
            onClose?.();
            alert(`Payment successful! Your plan is now ${planType}.`);
          } catch (e) {
            console.error(e);
            alert('Verification failed');
          }
        },
        theme: { color: '#000000' },
      };

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
          document.body.appendChild(script);
        });
      }

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || e?.message || 'Failed to start checkout';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upgrade Plan</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.type} className="border rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="text-xl font-semibold">{p.type}</div>
                <div className="text-2xl mt-1">{p.priceText}</div>
                <div className="text-sm text-gray-600 mt-2">{p.desc}</div>
              </div>
              <Button className="mt-4 bg-black text-white" disabled={loading} onClick={() => startCheckout(p)}>
                {loading ? 'Please wait…' : `Choose ${p.type}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;


