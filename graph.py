import matplotlib.pyplot as plt
import numpy as np


def rgbtohex(*color):
    return '#' + ''.join(f'{i:02X}' for i in color)


def make_graph(data, headers, path):
    mx_len = max(map(len, data))
    mx_y = max(map(max, data))
    mn_y = min(map(min, data))

    plt.style.use('_mpl-gallery')

    fig, ax = plt.subplots()

    r, g, b = 57, 100, 198
    
    for i in range(len(data)):
        x = np.arange(0, len(data[i]), 1)
        y = np.array(data[i])

        ax.plot(x, y, linewidth=2.0, color=rgbtohex(r, g, b))
        b += 10
        b %= 256
        g += 40
        g %= 256
        r += 2
        r %= 256

    ax.legend(headers)

    ax.set(
        xlim=(0, mx_len + 10), xticks=np.arange(1, mx_len + 10),
        ylim=(mn_y - 2, mx_y + 2), yticks=np.arange(mn_y - 2, mx_y + 2))

    plt.savefig(path)


if __name__ == "__main__":
    data = [
        [0, 1, 3, 5], [3, 4, 2, 5, 0, 0], [6, 4, 5, 3, 6, 3],
        [-10, -9, -5, 1, 4, 8], [-6, -4, -7, 0]]
    headers = ["temp1", "arkotemp", "arkana", "inferno", "freeze"]
    make_graph(data, headers)
