import React from "react";
import { DataTable } from "react-native-paper";

type GenericTableProps<T> = {
    headers: Array<{ key: string; title: string }>;
    data: T[];
    renderCellComponents: Array<(item: T) => React.ReactNode | undefined>;
};

const GenericTable = <T extends {}>({
    headers,
    data,
    renderCellComponents,
}: GenericTableProps<T>) => {
    return (
        <DataTable>
            <DataTable.Header>
                {headers.map((header) => (
                    <DataTable.Title key={header.key}>
                        {header.title}
                    </DataTable.Title>
                ))}
            </DataTable.Header>

            {data.map((item, index) => (
                <DataTable.Row key={index}>
                    {renderCellComponents?.map((renderCell, cellIndex) => (
                        <DataTable.Cell key={cellIndex}>
                            {renderCell(item)}
                        </DataTable.Cell>
                    ))}
                </DataTable.Row>
            ))}
        </DataTable>
    );
};

export default GenericTable;
