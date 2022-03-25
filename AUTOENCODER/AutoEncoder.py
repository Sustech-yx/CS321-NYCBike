import numpy as np
from torch import nn
from torch import nn
import torch.nn.functional as F
from torch.autograd import Variable
import torch
   
class AutoEncoder(nn.Module):
    def __init__(self):
        super(AutoEncoder, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, 3, stride=3)
        self.conv2 =nn.Conv2d(16, 8, 3, stride=2, padding=1)
        self.fc_e = nn.Linear(8 * 4 * 4, 64)

        self.fc_d = nn.Linear(64, 8 * 4 * 4)
        self.convT1 = nn.ConvTranspose2d(8, 8, 3, stride=3)  # b, 8, 12, 12
        self.convT2 = nn.ConvTranspose2d(8, 16, 3, stride=2, padding=1)  # b, 16, 23, 23
        self.convT3 = nn.ConvTranspose2d(16, 1, 5, stride=3, padding=1)  # b, 1, 69, 69

        self.test = False
        self.compressed = []

    def encode(self, x):
        # input 1, 69, 69

        # cov1 16, 21, 21
        # pool1 16, 11, 11
        x = F.max_pool2d(F.relu(self.conv1(x)), kernel_size=3, stride=2, padding=1)

        # cov2 8, 6, 6
        # pool2 8, 4, 4
        x = F.max_pool2d(F.relu(self.conv2(x)), kernel_size=2, stride=2, padding=1)

        x = x.view(-1, 8 * 4 * 4)
        x = F.relu(self.fc_e(x))
        return x

    def decode(self, x):
        x = F.relu(self.fc_d(x))
        x = torch.reshape(x, (-1, 8, 4, 4, ))
        x = self.convT1(x)
        x = self.convT2(x)
        x = self.convT3(x)
        return x

    
    def forward(self, x):
        encoded = self.encode(x)
        if self.test:
            self.compressed.append(encoded)
        decoded = self.decode(encoded)
        return decoded

if __name__ == '__main__':
    model = AutoEncoder().cuda()
    data = torch.from_numpy(np.random.randn(64, 1, 69, 69)) 
    data = data.type(torch.FloatTensor)
    data = Variable(data).cuda()
    output = model(data)
    print(output)
    print(output.shape)