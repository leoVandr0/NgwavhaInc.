import React from 'react';
import { Card, Empty, Button } from 'antd';
import { Plus } from 'lucide-react';

const AdminPlaceholder = ({ title, description }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                <Button type="primary" icon={<Plus size={16} />}>
                    Add New
                </Button>
            </div>

            <Card className="bg-dark-800 border-dark-700">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="text-center">
                            <p className="text-dark-300 mb-2">{description || `The ${title} module is currently under development.`}</p>
                            <p className="text-dark-500 text-sm italic">This feature will allow you to manage {title.toLowerCase()} for the Ngwavha platform.</p>
                        </div>
                    }
                />
            </Card>
        </div>
    );
};

export default AdminPlaceholder;
