# useSelectedObject

The `useSelectedObject` hook provides access to the currently selected object in 3Lens devtools and controls for managing selection state.

## Import

```tsx
import { useSelectedObject } from '@3lens/react-bridge';
```

## Usage

```tsx
import { useSelectedObject } from '@3lens/react-bridge';

function SelectionInfo() {
  const { selectedNode, hasSelection, clear } = useSelectedObject();

  if (!hasSelection) {
    return <div>Nothing selected</div>;
  }

  return (
    <div>
      <h3>Selected: {selectedNode?.ref.name || 'Unnamed'}</h3>
      <p>Type: {selectedNode?.ref.type}</p>
      <button onClick={clear}>Deselect</button>
    </div>
  );
}
```

## Signature

```tsx
function useSelectedObject(): UseSelectedObjectResult
```

## Return Value

### UseSelectedObjectResult

| Property | Type | Description |
|----------|------|-------------|
| `selectedNode` | `SceneNode \| null` | The currently selected scene node (full node data) |
| `selectedUuid` | `string \| null` | The selected object's UUID |
| `selectedName` | `string \| null` | The selected object's name |
| `selectedType` | `string \| null` | The selected object's type (e.g., `'Mesh'`, `'Group'`) |
| `hasSelection` | `boolean` | Whether an object is currently selected |
| `select` | `(uuid: string) => void` | Function to select an object by UUID |
| `clear` | `() => void` | Function to clear the current selection |
| `isSelected` | `(uuid: string) => boolean` | Check if a specific object is selected |

## Examples

### Display Selection Details

```tsx
function SelectionPanel() {
  const { selectedNode, hasSelection, selectedType, clear } = useSelectedObject();

  if (!hasSelection) {
    return (
      <div className="selection-panel empty">
        <p>Click an object to inspect it</p>
      </div>
    );
  }

  return (
    <div className="selection-panel">
      <header>
        <h3>{selectedNode?.ref.name || 'Unnamed Object'}</h3>
        <span className="type-badge">{selectedType}</span>
        <button onClick={clear}>×</button>
      </header>
      
      <section>
        <h4>Transform</h4>
        <p>Position: {selectedNode?.ref.position.join(', ')}</p>
        <p>Rotation: {selectedNode?.ref.rotation.join(', ')}</p>
        <p>Scale: {selectedNode?.ref.scale.join(', ')}</p>
      </section>
    </div>
  );
}
```

### Highlight Selected Object in Scene List

```tsx
function SceneObjectList({ objects }) {
  const { isSelected, select, clear } = useSelectedObject();

  return (
    <ul className="scene-list">
      {objects.map((obj) => (
        <li
          key={obj.uuid}
          className={isSelected(obj.uuid) ? 'selected' : ''}
          onClick={() => {
            if (isSelected(obj.uuid)) {
              clear();
            } else {
              select(obj.uuid);
            }
          }}
        >
          {obj.name || obj.type}
        </li>
      ))}
    </ul>
  );
}
```

### Sync Selection with Application State

```tsx
function EditorCanvas() {
  const { selectedUuid, select, clear } = useSelectedObject();
  const [editingObject, setEditingObject] = useAppStore((s) => s.editingObject);

  // Sync 3Lens selection with app state
  useEffect(() => {
    if (editingObject && editingObject.uuid !== selectedUuid) {
      select(editingObject.uuid);
    } else if (!editingObject && selectedUuid) {
      clear();
    }
  }, [editingObject, selectedUuid, select, clear]);

  return <Canvas>{/* ... */}</Canvas>;
}
```

### Selection-Based Actions

```tsx
function ObjectActions() {
  const { selectedNode, hasSelection, selectedUuid } = useSelectedObject();
  const { scene } = useThree();

  const deleteSelected = () => {
    if (!selectedUuid) return;
    
    const object = scene.getObjectByProperty('uuid', selectedUuid);
    if (object && object.parent) {
      object.parent.remove(object);
    }
  };

  const duplicateSelected = () => {
    if (!selectedUuid) return;
    
    const object = scene.getObjectByProperty('uuid', selectedUuid);
    if (object) {
      const clone = object.clone();
      clone.position.x += 1;
      scene.add(clone);
    }
  };

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="object-actions">
      <button onClick={duplicateSelected}>Duplicate</button>
      <button onClick={deleteSelected} className="danger">Delete</button>
    </div>
  );
}
```

### Conditional Rendering Based on Object Type

```tsx
function PropertyEditor() {
  const { selectedNode, selectedType, hasSelection } = useSelectedObject();

  if (!hasSelection) {
    return null;
  }

  switch (selectedType) {
    case 'Mesh':
      return <MeshEditor node={selectedNode} />;
    case 'Light':
    case 'PointLight':
    case 'DirectionalLight':
      return <LightEditor node={selectedNode} />;
    case 'Camera':
    case 'PerspectiveCamera':
      return <CameraEditor node={selectedNode} />;
    default:
      return <GenericEditor node={selectedNode} />;
  }
}
```

### Selection with Keyboard Navigation

```tsx
function SceneTree({ nodes }) {
  const { selectedUuid, select, clear } = useSelectedObject();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      clear();
    }
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const currentIndex = nodes.findIndex((n) => n.uuid === selectedUuid);
      const nextIndex = e.key === 'ArrowDown' 
        ? Math.min(currentIndex + 1, nodes.length - 1)
        : Math.max(currentIndex - 1, 0);
      
      if (nodes[nextIndex]) {
        select(nodes[nextIndex].uuid);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUuid, nodes]);

  return (
    <ul>
      {nodes.map((node) => (
        <li
          key={node.uuid}
          className={selectedUuid === node.uuid ? 'selected' : ''}
          onClick={() => select(node.uuid)}
        >
          {node.name}
        </li>
      ))}
    </ul>
  );
}
```

## SceneNode Structure

The `selectedNode` object contains:

```tsx
interface SceneNode {
  ref: {
    uuid: string;
    name: string;
    type: string;
    visible: boolean;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    // ... additional properties
  };
  children: SceneNode[];
  parent: SceneNode | null;
  depth: number;
  path: string;
}
```

## Related

- [ThreeLensProvider](./three-lens-provider.md) - Required context provider
- [useThreeLensProbe](./use-three-lens-probe.md) - Direct probe access
- [Selection API](/api/core/selection-api) - Core selection functionality
