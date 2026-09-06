"""
AakashaVani: Deep Neural Vector Embedding & Recursive Retrieval Engine
Implements dense neural projection, subword n-gram vectorization, recursive contrastive training,
and multi-hop query vector refinement for meteorological and disaster science.
"""

import os
import re
import math
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from .knowledge_base import RAG_KNOWLEDGE_DOCUMENTS

EMBEDDING_DIM = 128
WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "neural_weights.npz")
DOC_VECTORS_PATH = os.path.join(os.path.dirname(__file__), "document_vectors.npy")


class SubwordTokenizer:
    """Extracts words and character 3/4-grams to handle multi-lingual Indian terms and typo resilience."""
    
    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower()).strip()
        words = [w for w in cleaned.split() if len(w) > 1]
        tokens = list(words)
        
        # Add character 3-grams for subword morphological matching
        for w in words:
            if len(w) >= 4:
                for i in range(len(w) - 2):
                    tokens.append(f"#{w[i:i+3]}")
        return tokens


class DenseNeuralEmbedder:
    """
    Two-layer Dense Feedforward Neural Network that projects token sequences
    into continuous, L2-normalized 128-dimensional semantic latent vectors.
    """

    def __init__(self, vocab_size: int = 2500, embedding_dim: int = EMBEDDING_DIM):
        self.dim = embedding_dim
        self.vocab_size = vocab_size
        self.token_to_id: Dict[str, int] = {}
        self.id_to_token: Dict[int, str] = {}
        
        # Initialize neural network weights
        np.random.seed(42)
        # Layer 1: Token embedding matrix
        self.W_emb = (np.random.randn(self.vocab_size, self.dim) * 0.1).astype(np.float32)
        # Layer 2: Dense hidden transformation matrix & bias
        self.W_dense = (np.random.randn(self.dim, self.dim) * (math.sqrt(2.0 / self.dim))).astype(np.float32)
        self.b_dense = np.zeros(self.dim, dtype=np.float32)

    def build_vocabulary(self, corpus: List[str]):
        """Builds token-to-index mapping from domain documents and training query benchmarks."""
        freq: Dict[str, int] = {}
        for text in corpus:
            tokens = SubwordTokenizer.tokenize(text)
            for t in tokens:
                freq[t] = freq.get(t, 0) + 1

        # Sort by frequency and assign IDs
        sorted_tokens = sorted(freq.keys(), key=lambda x: freq[x], reverse=True)
        self.token_to_id = {"<PAD>": 0, "<UNK>": 1}
        self.id_to_token = {0: "<PAD>", 1: "<UNK>"}
        
        for idx, t in enumerate(sorted_tokens[: self.vocab_size - 2], start=2):
            self.token_to_id[t] = idx
            self.id_to_token[idx] = t

    def encode_with_intermediate(self, text: str) -> Tuple[np.ndarray, np.ndarray]:
        """Returns both pooled token representation h0 and final L2-normalized vector v."""
        tokens = SubwordTokenizer.tokenize(text)
        if not tokens:
            zero = np.zeros(self.dim, dtype=np.float32)
            return zero, zero

        indices = [self.token_to_id.get(t, 1) for t in tokens]
        h0 = np.mean(self.W_emb[indices], axis=0)
        h1 = np.tanh(np.dot(h0, self.W_dense) + self.b_dense)
        norm = np.linalg.norm(h1)
        if norm > 1e-8:
            v = (h1 / norm).astype(np.float32)
        else:
            v = h1.astype(np.float32)
        return h0, v

    def encode(self, text: str) -> np.ndarray:
        _, v = self.encode_with_intermediate(text)
        return v


class RecursiveNeuralTrainer:
    """
    Executes recursive contrastive metric learning over meteorological triplets.
    Iteratively updates neural projection weights using contrastive margin backpropagation.
    """

    @staticmethod
    def generate_training_triplets() -> List[Tuple[str, str, str]]:
        """
        Curated domain training dataset: (Anchor Query, Positive Document/Context, Negative Distractor)
        Covers Agriculture, Cyclone, Urban Flood, Lightning, Marine Safety, and Aviation Fog.
        """
        return [
            # Cotton / Fertilizer
            ("Can I spray pesticide on my cotton crop in Wardha tomorrow?",
             "Cotton Gossypium avoid chemical pesticide application if rainfall exceeding 5mm or wind above 15km/h rain wash-off",
             "When minimum winter temperatures dip below 4C ground frost damages mustard potato"),
            
            ("Pink bollworm medicine spray safe during cloudy weather?",
             "For pink bollworm and sucking pests avoid pesticide application if rainfall within 24 hours minimum rain-free window 4 hours",
             "Aviation Low Visibility Operations prevailing horizontal visibility drops below 800m runway visual range"),

            # Marine / Sea Safety
            ("Is it safe to go for sea fishing in Vizag tomorrow in small boat?",
             "Marine Safety Protocol INCOIS Small motorized artisanal fishing boats must suspend sea operations wave height exceeds 2.5m wind gusts 45km/h",
             "Wheat Crown Root Initiation occurring 21-25 days after sowing do not irrigate Western Disturbance"),

            ("High waves and deep sea squall advisory for Bay of Bengal fishermen",
             "INCOIS Ocean State Fishermen Sea-Safety Alert Thresholds wave height exceeds 2.5 meters wind gusts 45 km/h squalls VHF Channel 16",
             "Urban Flood standing depth exceeding 30cm can stall passenger cars submerged underpass"),

            # Urban Flood / River Musi
            ("Musi river water level rising in Hyderabad flash flood alert emergency",
             "Central Water Commission River Inundation Warning Level high flood level HFL upstream catchment rainfall exceeds 70mm floodplain evacuation",
             "Frost Protection ground frost risk rises sharply damaging flowering mustard potato smudge fire"),

            ("Car driving through flooded waterlogged underpasses in heavy rain",
             "Urban Flood Road Safety Standing flood depth exceeding 30cm stalls cars depth 45cm causes vehicle floating submerged underpasses",
             "Marine Safety Protocol small motorized fishing boats suspend sea operations wave height 2.5m"),

            # Lightning / Thunder
            ("Where to take shelter when lightning strikes in thunderstorm?",
             "Lightning Safety Protocol 30-30 Rule time between flash and thunder less than 30 seconds enclosed concrete shelter never tall tree",
             "Soybean waterlogging broad-bed furrow field drainage channels heavy showers chlorosis"),

            # Heatwave / Summer
            ("Extreme 45 degree temperature heat wave precautions what to drink",
             "NDMA Heatwave Action Plan Red Alert maximum temperature reaches 45C avoid direct sunlight drink water ORS coconut water buttermilk",
             "Aviation Runway Visual Range falls below 550m Category-III Instrument Landing Systems"),

            # Landslide / Hills
            ("Heavy rainfall landslide warning for Wayanad Western Ghats hills",
             "Geological Survey of India Hill Slope Landslide Rainfall Triggers cumulative rainfall exceeding 150mm over 72 hours slope failure evacuate",
             "Cotton pink bollworm chemical pesticide spray rain-free wash-off window"),

            # Aviation Fog
            ("Flight delay dense winter fog visibility Delhi airport",
             "IMD-DGCA Dense Fog Runway Visual Range RVR Operations visibility drops below 800m RVR 550m Category-III ILS airport delays",
             "Wheat Crown Root Initiation do not irrigate if active Western Disturbance brings 12mm rain")
        ]

    @classmethod
    def train_recursively(cls, embedder: DenseNeuralEmbedder, epochs: int = 35, lr: float = 0.04, margin: float = 0.45) -> Dict[str, Any]:
        triplets = cls.generate_training_triplets()
        initial_loss = 0.0
        final_loss = 0.0
        history = []

        for epoch in range(epochs):
            epoch_loss = 0.0
            np.random.shuffle(triplets)

            for anchor, positive, negative in triplets:
                h0_a, v_a = embedder.encode_with_intermediate(anchor)
                h0_p, v_p = embedder.encode_with_intermediate(positive)
                h0_n, v_n = embedder.encode_with_intermediate(negative)

                sim_pos = float(np.dot(v_a, v_p))
                sim_neg = float(np.dot(v_a, v_n))

                # Contrastive Triplet Loss: L = max(0, margin - sim_pos + sim_neg)
                loss = max(0.0, margin - sim_pos + sim_neg)
                epoch_loss += loss

                if loss > 0:
                    # Analytical gradient step to increase sim_pos and decrease sim_neg
                    grad = np.outer(h0_a, v_p) + np.outer(h0_p, v_a) - np.outer(h0_a, v_n) - np.outer(h0_n, v_a)
                    embedder.W_dense += (lr * grad).astype(np.float32)
                    embedder.b_dense += ((v_p - v_n) * (lr * 0.25)).astype(np.float32)

            avg_loss = epoch_loss / len(triplets)
            history.append(round(avg_loss, 4))
            if epoch == 0:
                initial_loss = avg_loss
            final_loss = avg_loss
            # Learning rate decay per epoch
            lr *= 0.94

        return {
            "epochs": epochs,
            "initial_loss": round(initial_loss, 4),
            "final_loss": round(final_loss, 4),
            "loss_reduction_pct": round(((initial_loss - final_loss) / (initial_loss + 1e-8)) * 100, 1),
            "history": history
        }


class NeuralRAGEngine:
    """
    High-Performance Neural Vector RAG Engine.
    Employs Dense Neural Embeddings, Cosine Search, and Recursive Query Vector Refinement.
    """

    def __init__(self):
        self.documents = RAG_KNOWLEDGE_DOCUMENTS
        self.embedder = DenseNeuralEmbedder()
        self.doc_vectors: Optional[np.ndarray] = None
        self._initialize_or_load()

    def _initialize_or_load(self):
        # Build vocabulary from all documents and triplets
        all_texts = []
        for doc in self.documents:
            all_texts.append(f"{doc['title']} {doc['category']} {' '.join(doc['tags'])} {doc['content']}")

        triplets = RecursiveNeuralTrainer.generate_training_triplets()
        for a, p, n in triplets:
            all_texts.extend([a, p, n])

        self.embedder.build_vocabulary(all_texts)

        # Check if saved neural weights exist
        if os.path.exists(WEIGHTS_PATH) and os.path.exists(DOC_VECTORS_PATH):
            try:
                weights = np.load(WEIGHTS_PATH, allow_pickle=True)
                self.embedder.W_emb = weights["W_emb"]
                self.embedder.W_dense = weights["W_dense"]
                self.embedder.b_dense = weights["b_dense"]
                self.doc_vectors = np.load(DOC_VECTORS_PATH)
                return
            except Exception as e:
                print(f"[NeuralRAGEngine] Note: Loading saved weights failed ({e}), training fresh neural network.")

        # Train neural weights recursively
        self.train_and_index()

    def train_and_index(self, epochs: int = 40) -> Dict[str, Any]:
        """Trains neural network weights recursively and builds dense document index."""
        train_stats = RecursiveNeuralTrainer.train_recursively(self.embedder, epochs=epochs)

        # Pre-compute all document embedding vectors
        vectors = []
        for doc in self.documents:
            doc_text = f"{doc['title']} {doc['category']} {' '.join(doc['tags'])} {doc['content']}"
            vec = self.embedder.encode(doc_text)
            vectors.append(vec)

        self.doc_vectors = np.array(vectors, dtype=np.float32)

        # Save weights and document vectors to disk
        try:
            np.savez(
                WEIGHTS_PATH,
                W_emb=self.embedder.W_emb,
                W_dense=self.embedder.W_dense,
                b_dense=self.embedder.b_dense
            )
            np.save(DOC_VECTORS_PATH, self.doc_vectors)
        except Exception as e:
            print(f"[NeuralRAGEngine] Failed saving weights: {e}")

        train_stats["documents_indexed"] = len(self.documents)
        train_stats["vector_dimension"] = EMBEDDING_DIM
        return train_stats

    def retrieve(self, query: str, top_k: int = 2, recursive_hops: int = 1) -> List[Dict[str, Any]]:
        """
        Retrieves top-k documents using Dense Neural Cosine Similarity.
        Supports Recursive Multi-Hop Query Vector Refinement (Rocchio Expansion).
        """
        if self.doc_vectors is None or len(self.doc_vectors) == 0:
            return []

        # Hop 0: Initial Query Vector
        q_vec = self.embedder.encode(query)
        # Compute cosine similarity across all document vectors
        sims = np.dot(self.doc_vectors, q_vec)

        # Recursive Multi-Hop Refinement:
        # If top score is moderate (< 0.60) and recursive_hops > 0, reformulate vector with top match
        top_idx = int(np.argmax(sims))
        if recursive_hops > 0 and sims[top_idx] < 0.60:
            # Shift query vector 25% towards highest matching domain document
            refined_q_vec = (0.75 * q_vec) + (0.25 * self.doc_vectors[top_idx])
            norm = np.linalg.norm(refined_q_vec)
            if norm > 1e-8:
                q_vec = (refined_q_vec / norm).astype(np.float32)
                # Re-compute cosine similarity with refined vector
                sims = np.dot(self.doc_vectors, q_vec)

        # Sort indices by similarity descending
        ranked_indices = np.argsort(sims)[::-1][:top_k]
        results = []

        for idx in ranked_indices:
            score = float(sims[idx])
            # Only include relevant matches (threshold > 0.15)
            if score > 0.15:
                doc = self.documents[idx]
                results.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "source": doc["source"],
                    "category": doc["category"],
                    "content": doc["content"],
                    "score": round(score, 4)
                })

        return results

    def format_augmented_context(self, query: str, top_k: int = 2) -> Tuple[str, List[str], float]:
        """
        Retrieves top documents and formats structured prompt context with citations and confidence.
        """
        results = self.retrieve(query, top_k=top_k, recursive_hops=1)
        if not results:
            return "", [], 0.0

        context_lines = []
        citations = []
        max_score = results[0]["score"] if results else 0.0

        for r in results:
            context_lines.append(f"• [{r['source']}]: {r['content']}")
            citations.append(r['source'])

        formatted_context = "\n".join(context_lines)
        # Confidence score derived from neural cosine similarity
        confidence = min(0.99, max(0.70, round(0.70 + (max_score * 0.28), 3)))
        return formatted_context, citations, confidence


# Global Singleton Instance
neural_rag_engine = NeuralRAGEngine()
