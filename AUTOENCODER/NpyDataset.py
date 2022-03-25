import torch
import numpy as np
from torchvision import transforms
from torch.utils.data import Dataset

class NpyDataset(Dataset):
    def __init__(self, path):
        self.data = np.load(path) 
        self.transforms = transforms.ToTensor()

    def __getitem__(self, index):
        item = self.data[index, :, :]
        item = self.transforms(item)
        item = item.type(torch.FloatTensor)
        return item

    def __len__(self):
        return self.data.shape[0]