import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, Input, Button, Modal } from '../common';

/**
 * Quote Creator Component
 * Create and send custom quotes to customers
 */
const QuoteCreator = ({ bookingId: propBookingId }) => {
  const navigate = useNavigate();
  const { bookingId: paramBookingId } = useParams();
  const bookingId = propBookingId || paramBookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const [quoteData, setQuoteData] = useState({
    items: [
      { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ],
    laborCost: 0,
    materialsCost: 0,
    additionalCosts: [],
    discount: 0,
    tax: 0,
    estimatedDuration: '',
    validUntil: '',
    notes: '',
    terms: '',
  });

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
    // Set default valid until date (7 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setQuoteData(prev => ({
      ...prev,
      validUntil: defaultDate.toISOString().split('T')[0],
    }));
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/workers/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteData.items];
    newItems[index][field] = value;

    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setQuoteData({ ...quoteData, items: newItems });
  };

  // Add new item
  const addItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  // Remove item
  const removeItem = (index) => {
    if (quoteData.items.length > 1) {
      const newItems = quoteData.items.filter((_, i) => i !== index);
      setQuoteData({ ...quoteData, items: newItems });
    }
  };

  // Add additional cost
  const addAdditionalCost = () => {
    setQuoteData({
      ...quoteData,
      additionalCosts: [...quoteData.additionalCosts, { description: '', amount: 0 }],
    });
  };

  // Remove additional cost
  const removeAdditionalCost = (index) => {
    const newCosts = quoteData.additionalCosts.filter((_, i) => i !== index);
    setQuoteData({ ...quoteData, additionalCosts: newCosts });
  };

  // Handle additional cost change
  const handleAdditionalCostChange = (index, field, value) => {
    const newCosts = [...quoteData.additionalCosts];
    newCosts[index][field] = value;
    setQuoteData({ ...quoteData, additionalCosts: newCosts });
  };

  // Calculate totals
  const calculateTotals = () => {
    const itemsTotal = quoteData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const additionalTotal = quoteData.additionalCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
    const subtotal = itemsTotal + parseFloat(quoteData.laborCost || 0) + parseFloat(quoteData.materialsCost || 0) + additionalTotal;
    const discountAmount = (subtotal * (parseFloat(quoteData.discount) || 0)) / 100;
    const taxAmount = ((subtotal - discountAmount) * (parseFloat(quoteData.tax) || 0)) / 100;
    const total = subtotal - discountAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  // Validate quote
  const validateQuote = () => {
    const newErrors = {};

    if (quoteData.items.length === 0) {
      newErrors.items = 'Add at least one item';
    }

    quoteData.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item_${index}`] = 'Description is required';
      }
    });

    if (!quoteData.estimatedDuration) {
      newErrors.estimatedDuration = 'Estimated duration is required';
    }

    if (!quoteData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    const totals = calculateTotals();
    if (totals.total <= 0) {
      newErrors.total = 'Quote total must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit quote
  const handleSubmit = async () => {
    if (!validateQuote()) {
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/workers/quotes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            bookingId,
            ...quoteData,
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            taxAmount: totals.taxAmount,
            totalAmount: totals.total,
          }),
        }
      );

      if (response.ok) {
        navigate(`/worker/bookings/${bookingId}`);
      } else {
        const data = await response.json();
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      setErrors({ general: 'Failed to create quote' });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
          {booking && (
            <p className="text-gray-600 mt-1">
              For booking: {booking.serviceType}
            </p>
          )}
        </div>
        <Button variant="ghost" onClick={() => setShowPreview(true)}>
          Preview Quote
        </Button>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <Card>
        <div className="space-y-6">
          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items/Services</h2>
              <Button variant="outline" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {quoteData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      error={errors[`item_${index}`]}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-right font-semibold">
                      {item.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                    {quoteData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labor & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="laborCost"
              label="Labor Cost (LKR)"
              value={quoteData.laborCost}
              onChange={(e) => setQuoteData({ ...quoteData, laborCost: e.target.value })}
              placeholder="5000"
              min="0"
            />
            <Input
              type="number"
              name="materialsCost"
              label="Materials Cost (LKR)"
              value={quoteData.materialsCost}
              onChange={(e) => setQuoteData({ ...quoteData, materialsCost: e.target.value })}
              placeholder="3000"
              min="0"
            />
          </div>

          {/* Additional Costs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Costs</h2>
              <Button variant="outline" size="sm" onClick={addAdditionalCost}>
                Add Cost
              </Button>
            </div>

            {quoteData.additionalCosts.map((cost, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start mb-4">
                <div className="col-span-9">
                  <Input
                    type="text"
                    placeholder="Description (e.g., Transportation)"
                    value={cost.description}
                    onChange={(e) => handleAdditionalCostChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={cost.amount}
                    onChange={(e) => handleAdditionalCostChange(index, 'amount', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeAdditionalCost(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Discount & Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="discount"
              label="Discount (%)"
              value={quoteData.discount}
              onChange={(e) => setQuoteData({ ...quoteData, discount: e.target.value })}
              placeholder="0"
              min="0"
              max="100"
            />
            <Input
              type="number"
              name="tax"
              label="Tax/VAT (%)"
              value={quoteData.tax}
              onChange={(e) => setQuoteData({ ...quoteData, tax: e.target.value })}
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          {/* Totals Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">LKR {totals.subtotal.toLocaleString()}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({quoteData.discount}%):</span>
                <span className="font-semibold">- LKR {totals.discountAmount.toLocaleString()}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax ({quoteData.tax}%):</span>
                <span className="font-semibold">+ LKR {totals.taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2">
              <span>Total:</span>
              <span>LKR {totals.total.toLocaleString()}</span>
            </div>
          </div>

          {errors.total && (
            <p className="text-sm text-red-600">{errors.total}</p>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="estimatedDuration"
              label="Estimated Duration"
              value={quoteData.estimatedDuration}
              onChange={(e) => setQuoteData({ ...quoteData, estimatedDuration: e.target.value })}
              error={errors.estimatedDuration}
              placeholder="2-3 hours"
              required
            />
            <Input
              type="date"
              name="validUntil"
              label="Valid Until"
              value={quoteData.validUntil}
              onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
              error={errors.validUntil}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Notes */}
          <Input
            type="textarea"
            name="notes"
            label="Additional Notes"
            value={quoteData.notes}
            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
            placeholder="Any additional information for the customer..."
            rows={3}
          />

          {/* Terms */}
          <Input
            type="textarea"
            name="terms"
            label="Terms and Conditions"
            value={quoteData.terms}
            onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
            placeholder="Payment terms, warranty, etc..."
            rows={4}
          />

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              loading={loading}
            >
              Send Quote to Customer
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <QuotePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        quoteData={quoteData}
        booking={booking}
        totals={totals}
      />
    </div>
  );
};

// Quote Preview Modal
const QuotePreviewModal = ({ isOpen, onClose, quoteData, booking, totals }) => {
  const worker = JSON.parse(sessionStorage.getItem('user'));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote Preview" size="xl">
      <div className="space-y-6 p-6 bg-white">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">QUOTE</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">From:</p>
              <p className="font-semibold">{worker?.name}</p>
              <p className="text-gray-600">{worker?.phoneNumber}</p>
            </div>
            {booking && (
              <div>
                <p className="text-gray-600">To:</p>
                <p className="font-semibold">{booking.customer?.name}</p>
                <p className="text-gray-600">{booking.customer?.phoneNumber}</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm">
            <p className="text-gray-600">
              Valid Until: {new Date(quoteData.validUntil).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              Estimated Duration: {quoteData.estimatedDuration}
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quoteData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold">{item.total.toLocaleString()}</td>
                </tr>
              ))}
              {parseFloat(quoteData.laborCost) > 0 && (
                <tr className="border-b">
                  <td className="px-4 py-2">Labor Cost</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {parseFloat(quoteData.laborCost).toLocaleString()}
                  </td>
                </tr>
              )}
              {parseFloat(quoteData.materialsCost) > 0 && (
                <tr className="border-b">
                  <td className="px-4 py-2">Materials Cost</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {parseFloat(quoteData.materialsCost).toLocaleString()}
                  </td>
                </tr>
              )}
              {quoteData.additionalCosts.map((cost, index) => (
                <tr key={`add-${index}`} className="border-b">
                  <td className="px-4 py-2">{cost.description}</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {parseFloat(cost.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">LKR {totals.subtotal.toLocaleString()}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">- LKR {totals.discountAmount.toLocaleString()}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold">+ LKR {totals.taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
              <span>Total:</span>
              <span>LKR {totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quoteData.notes && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Notes:</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quoteData.notes}</p>
          </div>
        )}

        {/* Terms */}
        {quoteData.terms && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Terms and Conditions:</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quoteData.terms}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close Preview</Button>
        </div>
      </div>
    </Modal>
  );
};

QuoteCreator.propTypes = {
  bookingId: PropTypes.string,
};

QuotePreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  quoteData: PropTypes.object.isRequired,
  booking: PropTypes.object,
  totals: PropTypes.object.isRequired,
};

export default QuoteCreator;