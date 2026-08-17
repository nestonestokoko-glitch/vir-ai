type MotionPresetCardProps = {
  name: string;
  description: string;
  icon: string;
};

const MotionPresetCard = ({ name, description, icon }: MotionPresetCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-indigo-300">
      <div className="flex items-center justify-center h-12 w-12 mb-4 bg-indigo-50 rounded-full">
        {/* Icon placeholder - would be replaced with actual icons */}
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default MotionPresetCard;