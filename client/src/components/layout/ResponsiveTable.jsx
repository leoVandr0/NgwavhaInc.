import React from 'react';
import { Table } from 'antd';

const ResponsiveTable = ({ 
    columns = [], 
    dataSource = [], 
    pagination = false, 
    className = '', 
    ...props 
}) => {
    // Enhanced columns with proper text handling
    const enhancedColumns = columns.map(col => ({
        ...col,
        className: col.className ? `${col.className} whitespace-nowrap` : 'whitespace-nowrap',
        // Ensure proper text wrapping for long content
        render: col.render ? col.render : (text) => (
            <span className="block truncate max-w-xs" title={text}>
                {text}
            </span>
        )
    }));

    return (
        <div className="overflow-x-auto overflow-y-visible">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden rounded-lg border border-dark-700">
                    <Table
                        {...props}
                        columns={enhancedColumns}
                        dataSource={dataSource}
                        pagination={pagination}
                        className={`bg-dark-800 ${className}`}
                        rowClassName="hover:bg-dark-700 transition-colors"
                        scroll={{ x: 'max-content' }}
                        size="middle"
                    />
                </div>
            </div>
        </div>
    );
};

export default ResponsiveTable;
