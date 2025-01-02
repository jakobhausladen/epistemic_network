def check_pentagram(nodes, edges):
    if len(nodes) != 5:
        return False
    
    nodes.sort()
    # Expected edges
    pentagram_edges = []
    for i in range(5):
        pentagram_edges.append((nodes[i], nodes[(i + 2) % 5]))

    # Rearrange edges
    edges = [(min(edge), max(edge)) for edge in edges]
    pentagram_edges = [(min(edge), max(edge)) for edge in pentagram_edges]

    return set(pentagram_edges) == set(edges)