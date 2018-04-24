library(data.table)

fread("./data/SampleFoodViolData.csv", stringsAsFactors=F) -> food_viola


library(magrittr)
library(plyr)


filtered <- dplyr::filter(food_viola, ViolStatus == 'Fail' & Location != '')
filteredp <- dplyr::filter(food_viola, ViolStatus == 'Pass' & Location != '')

df <- ddply(filtered,
            .(businessName, LegalOwner, NameLast, NameFirst, LICENSENO, DESCRIPT, Address, CITY, STATE, ZIP, Location),
            summarise,
            Severity = length(businessName))

pf <- ddply(filteredp,
            .(businessName),
            summarise,
            Positivity = length(businessName))

df <- merge(df,pf,by="businessName")
df <- df %>% tidyr::extract(Location, c("lat", "lng"), "\\(([^,]+), ([^)]+)\\)")

write.table(df, file = "./data/SampleMyData.csv", sep=",",row.names=FALSE)
