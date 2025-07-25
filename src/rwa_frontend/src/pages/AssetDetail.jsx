
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Shield, 
  FileText,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAsset, mintToken } from '../api/canister';
import { useWalletConnect } from '../hooks/useWallet';

const AssetDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { principal, isConnected } = useWalletConnect();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    getAsset(id)
      .then(setAsset)
      .catch(() => setError('Asset not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInvestment = async () => {
    if (!isConnected) {
      toast({ title: 'Connect Wallet', description: 'Please connect your wallet to invest.', variant: 'destructive' });
      return;
    }
    if (!investmentAmount || parseFloat(investmentAmount) < (asset?.token_price || 1)) {
      toast({ title: 'Invalid Investment Amount', description: `Minimum investment is $${asset?.token_price || 1}`, variant: 'destructive' });
      return;
    }
    setInvesting(true);
    try {
      const tokens = Math.floor(parseFloat(investmentAmount) / asset.token_price);
      await mintToken(asset.id, principal, tokens, asset.token_price);
      toast({ title: 'Investment Successful!', description: `You've invested $${investmentAmount} and received ${tokens} tokens in ${asset.name}` });
    setInvestmentAmount('');
    } catch (e) {
      toast({ title: 'Investment Failed', description: 'Could not complete investment. Please try again.', variant: 'destructive' });
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fundingProgress = ((asset?.sold_tokens / asset?.total_tokens) * 100);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;
  }

  if (!asset) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Asset not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/marketplace" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{asset.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {asset.location}
                      </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {asset.category}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {asset.status}
                    </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current Token Price</p>
                  <p className="text-2xl font-bold">${asset.token_price}</p>
                  </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {asset.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">Asset Image {index + 1}</span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">{asset.description}</p>
            </div>

            {/* Detailed Tabs */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-t-lg border-b-2 border-transparent hover:border-blue-600">
                  Overview
                </button>
                <button className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-t-lg border-b-2 border-transparent hover:border-blue-600">
                  Financials
                </button>
                <button className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-t-lg border-b-2 border-transparent hover:border-blue-600">
                  Documents
                </button>
                <button className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-t-lg border-b-2 border-transparent hover:border-blue-600">
                  Activity
                </button>
              </div>

                <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cap Rate</span>
                      <span className="font-semibold">{asset.key_metrics.cap_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupancy Rate</span>
                      <span className="font-semibold">{asset.key_metrics.occupancy_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location Score</span>
                      <span className="font-semibold">{asset.key_metrics.location_score}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Liquidity</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {asset.key_metrics.liquidity_rating}
                      </span>
                    </div>
                  </div>
                      </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">Investment Details</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value</span>
                      <span className="font-semibold">{formatCurrency(asset.total_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected APY</span>
                        <span className="font-semibold text-green-600">{asset.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Rating</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {asset.risk_rating}
                      </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min. Investment</span>
                      <span className="font-semibold">{formatCurrency(asset.minimum_investment)}</span>
                    </div>
                      </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Financial Breakdown (Monthly)</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4 text-green-600">Income</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rental Income</span>
                        <span className="font-semibold">{formatCurrency(asset.financials.monthly_rent)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-red-600">Expenses</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property Taxes</span>
                        <span className="font-semibold">{formatCurrency(asset.financials.property_taxes)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Insurance</span>
                            <span className="font-semibold">{formatCurrency(asset.financials.insurance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance</span>
                            <span className="font-semibold">{formatCurrency(asset.financials.maintenance)}</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between font-semibold">
                              <span>Total Expenses</span>
                          <span>{formatCurrency(asset.financials.operating_expenses)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Net Operating Income</span>
                    <span className="text-green-600">{formatCurrency(asset.financials.net_operating_income)}</span>
                  </div>
                </div>
                      </div>
                    </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Legal Documents</h3>
                    <div className="space-y-4">
                      {asset.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-semibold">{doc.name}</p>
                              <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                            Download
                      </button>
                        </div>
                      ))}
                    </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">Large Investment</p>
                          <p className="text-sm text-gray-600">$25,000 investment • 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">Dividend Payment</p>
                          <p className="text-sm text-gray-600">Monthly dividends distributed • 1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-semibold">New Investor Milestone</p>
                          <p className="text-sm text-gray-600">1,250 investors reached • 3 days ago</p>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
          </div>

          {/* Investment Panel */}
          <div className="space-y-6">
            {/* Investment Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Investment Overview</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{formatCurrency(asset.total_value)}</p>
                  <p className="text-gray-600">Total Asset Value</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>{Math.round(fundingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${fundingProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{asset.available_tokens.toLocaleString()} tokens left</span>
                    <span>{asset.total_investors.toLocaleString()} investors</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{asset.apy}%</p>
                    <p className="text-sm text-gray-600">Expected APY</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">${asset.token_price}</p>
                    <p className="text-sm text-gray-600">Per Token</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Invest Now</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="investment" className="block text-sm font-medium text-gray-700">Investment Amount (USD)</label>
                  <input
                    id="investment"
                    type="number"
                    placeholder={`Min. $${asset.minimum_investment}`}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {investmentAmount && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Investment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span>{formatCurrency(parseFloat(investmentAmount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span>{Math.floor(parseFloat(investmentAmount) / asset.token_price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Monthly Income:</span>
                        <span className="text-green-600">
                          {formatCurrency((parseFloat(investmentAmount) / asset.total_value) * asset.monthly_income)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleInvestment}
                  disabled={investing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {investing ? 'Investing...' : 'Invest Now'}
                </button>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secured by blockchain technology</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Launch Date</span>
                  <span className="font-semibold">
                    {new Date(asset.launch_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investors</span>
                  <span className="font-semibold">{asset.total_investors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold">{formatCurrency(asset.monthly_income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {asset.risk_rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
