import pandas as pd
import numpy as np
import random
import sys
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
# folders = pd.read_csv("/Users/h3yon/Desktop/TestLinkmoaDb_FolderDetail.csv", delimiter=',')
# folders = pd.read_csv("~/Desktop/FolderDetail.csv", delimiter=',')
# ratings = pd.read_csv("~/Desktop/LikeFolder.csv", delimiter=',')

folders = pd.read_csv("./src/app/controllers/recommend/FolderDetail.csv", delimiter=',')
ratings = pd.read_csv("./src/app/controllers/recommend/LikeFolder.csv", delimiter=',')


mask = folders['folderType'].isin(['private']) 
folders[~mask].head()

folders = folders.drop_duplicates("folderName", keep='first')
folders.head()

combine_folder_rating = pd.merge(ratings, folders, on='folderIdx')
combine_folder_rating.head(10)

columns = ['createdAt_x', 'updatedAt_x','status_y', 'userIdx_y', 'createdAt_y', 'updatedAt_y']
combine_folder_rating = combine_folder_rating.drop(columns, axis=1)
combine_folder_rating.head(10)

combine_folder_rating = combine_folder_rating.dropna(axis = 0, subset = ['folderName'])

folder_ratingCount = (combine_folder_rating.
     groupby(by = ['folderName'])['status_x'].
     count().
     reset_index().
     rename(columns = {'status_x': 'totalLikeCount'})
     [['folderName', 'totalLikeCount']]
    )
folder_ratingCount.head(10)

rating_with_totalLikeCount = combine_folder_rating.merge(folder_ratingCount, left_on = 'folderName', right_on = 'folderName', how = 'left')
rating_with_totalLikeCount.head(10)

user_rating = rating_with_totalLikeCount.drop_duplicates(['userIdx_x','folderName'])
user_rating.head(10)

folder_user_rating_pivot = user_rating.pivot(index = 'userIdx_x', columns = 'folderName', values = 'status_x').fillna(0)
folder_user_rating_pivot.head(10)

X = folder_user_rating_pivot.values.T
X.shape

import sklearn
from sklearn.decomposition import TruncatedSVD

SVD = TruncatedSVD(n_components=12, random_state=17)
matrix = SVD.fit_transform(X)
matrix.shape

import warnings
warnings.filterwarnings("ignore",category =RuntimeWarning)
corr = np.corrcoef(matrix)
corr.shape


folder_title = folder_user_rating_pivot.columns
folder_title_list = list(folder_title)
coffey_hands = folder_title_list.index(sys.argv[1])

corr_coffey_hands  = corr[coffey_hands]
# result = list(folder_title[(corr_coffey_hands>=0)])
# print(result,corr_coffey_hands)
resultList = list(folder_title[(corr_coffey_hands > 0.8)])
result = random.choice(resultList)
print(result)