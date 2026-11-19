"""Peak memory of loading one model and scoring one picture, in a fresh process."""
import resource, sys
import numpy as np, onnxruntime as ort
opts = ort.SessionOptions(); opts.intra_op_num_threads = 1; opts.inter_op_num_threads = 1
s = ort.InferenceSession(sys.argv[1], opts, providers=["CPUExecutionProvider"])
size = int(sys.argv[2])
s.run(None, {s.get_inputs()[0].name: np.zeros((1, 3, size, size), np.float32)})
print(round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024), "MB peak")
