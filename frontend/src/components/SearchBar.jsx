import {Search} from 'lucide-react'
const SearchBar = () => {
    return (
      <div className="relative w-80">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Search..."
        />
      </div>
    );
  };

  export default SearchBar