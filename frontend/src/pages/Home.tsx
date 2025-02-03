import { TrendingUp, Search } from 'lucide-react';
import { TrendingBillsInline } from '../components/TrendingBillsInline';
import { SearchCommand } from '../components/SearchCommand';
import { BillsFeed } from '../components/BillsFeed';
export function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-primary-100">
          <TrendingUp className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-2xl font-semibold">Trending Bills</h2>
      </div> */}
      <TrendingBillsInline />
      <div className="text-center mb-12 mx-auto mt-12" style={{marginTop: "160px"}}>
        <h1 className="text-4xl font-bold items-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
          Explore Congressional Bills with AI
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto mb-3">
          Get instant insights about U.S. congressional bills using AI technology.
          Connect your wallet to access premium features.
        </p>
        <div className="flex justify-center">
          <SearchCommand />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 w-full mb-12">
        <div className="lg:col-span-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-primary-100">
              <Search className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-semibold">Explore Bills</h2>
          </div>
          <BillsFeed />
        </div>
      </div>


    </div>
  );
}