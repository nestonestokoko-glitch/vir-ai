type TypographyStyleCardProps = {
  name: string;
  description: string;
  fonts: string;
  accent?: "indigo" | "gradient";
};

const TypographyStyleCard = ({ name, description, fonts, accent = "indigo" }: TypographyStyleCardProps) => {
  const isGradient = accent === "gradient";
  const titleClass = isGradient
    ? "text-xl font-semibold mb-2 bg-gradient-to-r from-blue-700 via-blue-500 to-sky-300 bg-clip-text text-transparent"
    : "text-xl font-semibold text-gray-900 mb-2";
  const iconWrap = isGradient ? "bg-gradient-to-r from-cyan-100 via-blue-100 to-violet-100" : "bg-indigo-50";
  const iconColor = isGradient ? "text-violet-600" : "text-indigo-600";
  const chipClass = isGradient
    ? "bg-gradient-to-r from-cyan-50 to-violet-50 text-violet-800"
    : "bg-indigo-50 text-indigo-800";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-indigo-300">
      <div className={`flex items-center justify-center h-12 w-12 mb-4 ${iconWrap} rounded-full`}>
        <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"></path>
        </svg>
      </div>
      <h3 className={titleClass}>{name}</h3>
      <p className="text-gray-600 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {fonts.split(", ").map((font, index) => (
          <span key={index} className={`${chipClass} text-xs font-medium px-2.5 py-1 rounded-full`}>
            {font}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TypographyStyleCard;