import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Rental Booking Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact & Customer Dispatch
        </h1>
        <p className="text-sm text-slate-500">
          Need assistance with an active booking, roadside assistance, or hub station logistics?
          Our fleet operations team is available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information & Hubs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900">Direct Communication Channels</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Fleet Dispatch Hotline</span>
                  <span className="text-slate-600 font-mono">+1 (555) 019-2831</span>
                  <span className="text-slate-400 block mt-0.5">Operating Daily 07:00 AM – 10:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Email Support Desk</span>
                  <span className="text-slate-600 font-mono">support@bikeshare-fleet.com</span>
                  <span className="text-slate-400 block mt-0.5">Average response under 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Hub Operating Hours</span>
                  <span className="text-slate-600">Monday – Sunday: 07:00 AM – 10:00 PM</span>
                  <span className="text-slate-400 block mt-0.5">24/7 Automated Return Docks at Central Terminal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hub Addresses */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800">Primary Hub Station Terminals</h4>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Central Park:</strong> North Meadow Trailhead Gate 4</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Downtown:</strong> Concourse B, Transit Terminal</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>University:</strong> Student Union Pavilion Quad</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Westside:</strong> Pier 64 Waterfront Boardwalk</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out. A fleet support representative has been notified and
                  will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                  }}
                  className="px-5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="font-extrabold text-lg text-slate-900 mb-1">
                  Send Us an Inquiry or Feedback
                </h3>
                <p className="text-slate-500 mb-4">
                  Fill out the details below and we will route your inquiry to the appropriate hub station supervisor.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                  >
                    <option value="Rental Booking Inquiry">Rental Booking & Extension Assistance</option>
                    <option value="Roadside Mechanical Help">Roadside Support / Flat Tire</option>
                    <option value="Security Deposit & Billing">Security Deposit Hold or Refund</option>
                    <option value="Group / Campus Rental Program">Group & Corporate Fleet Programs</option>
                    <option value="General Question">General Platform Question</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Message</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your inquiry, booking reference ID, or question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
