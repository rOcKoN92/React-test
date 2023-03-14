import React, { useState, useEffect } from 'react';
import SwaggerClient from 'swagger-client';
import uuid from 'uuid/v4';

function EditableTree() {
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const client = await SwaggerClient('/swagger.yaml');
      const { treeId } = await client.apis.trees.getTree();
      setTreeData(treeId);
    }
    fetchData();
  }, []);

  function renderNode(nodeData) {
    return (
      <li key={nodeData.id}>
        {nodeData.name}
        <div className="buttons">
          <button onClick={() => handleAddChild(nodeData)}>Add</button>
          <button onClick={() => handleEdit(nodeData)}>Edit</button>
          <button onClick={() => handleDelete(nodeData)}>Delete</button>
        </div>
        {nodeData.children && (
          <ul>{nodeData.children.map(renderNode)}</ul>
        )}
      </li>
    );
  }

  function handleAddChild(parentNode) {
    const newChild = { id: uuid(), name: 'New Child', children: [] };
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    addChildNode(newTreeData, parentNode.id, newChild);
    setTreeData(newTreeData);
  }

  function addChildNode(node, parentId, child) {
    if (node.id === parentId) {
      node.children.push(child);
    } else if (node.children) {
      node.children.forEach((childNode) =>
        addChildNode(childNode, parentId, child)
      );
    }
  }

  function handleEdit(node) {
    const newName = prompt('Enter new name:', node.name);
    if (newName) {
      const newTreeData = JSON.parse(JSON.stringify(treeData));
      editNodeName(newTreeData, node.id, newName);
      setTreeData(newTreeData);
    }
  }

  function editNodeName(node, nodeId, newName) {
    if (node.id === nodeId) {
      node.name = newName;
    } else if (node.children) {
      node.children.forEach((childNode) =>
        editNodeName(childNode, nodeId, newName)
      );
    }
  }

  function handleDelete(node) {
    const confirmed = window.confirm(`Delete ${node.name}?`);
    if (confirmed) {
      const newTreeData = JSON.parse(JSON.stringify(treeData));
      deleteNode(newTreeData, node.id);
      setTreeData(newTreeData);
    }
  }

  function deleteNode(node, nodeId) {
    if (node.children) {
      node.children = node.children.filter((childNode) =>
        childNode.id !== nodeId
      );
      node.children.forEach((childNode) => deleteNode(childNode, nodeId));
    }
  }

  if (!treeData) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {renderNode(treeData.rootNode)}
    </ul>
  );
}

export default EditableTree;
