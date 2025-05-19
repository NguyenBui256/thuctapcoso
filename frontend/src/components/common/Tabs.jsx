import React from "react";
import PropTypes from "prop-types";

export const Tabs = ({ children, activeTab, onChange }) => {
    // Lọc các children chỉ lấy component Tab
    const tabs = React.Children.toArray(children).filter(
        (child) => child.type === Tab
    );

    return (
        <div>
            <div className="border-b border-gray-200">
                <div className="flex -mb-px">
                    {tabs.map((tab) => (
                        <button
                            key={tab.props.id}
                            onClick={() => onChange(tab.props.id)}
                            className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${activeTab === tab.props.id
                                ? "border-teal-500 text-teal-500"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab.props.title}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                {tabs.find((tab) => tab.props.id === activeTab) || tabs[0]}
            </div>
        </div>
    );
};

export const Tab = ({ children, id }) => {
    return <div>{children}</div>;
};

Tabs.propTypes = {
    children: PropTypes.node.isRequired,
    activeTab: PropTypes.string,
    onChange: PropTypes.func,
};

Tab.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
}; 