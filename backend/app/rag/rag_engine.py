"""
AakashaVani: Neural Semantic Vector Retrieval Engine (RAG)
Powered by Dense Neural Network Embeddings, Cosine Search, and Recursive Multi-Hop Query Refinement.
"""

from typing import List, Dict, Any, Tuple
from .neural_vector_engine import neural_rag_engine, NeuralRAGEngine, DenseNeuralEmbedder, RecursiveNeuralTrainer

# Global Singleton Instance directly utilizing the Neural Vector Engine
rag_engine = neural_rag_engine
SemanticRAGEngine = NeuralRAGEngine
